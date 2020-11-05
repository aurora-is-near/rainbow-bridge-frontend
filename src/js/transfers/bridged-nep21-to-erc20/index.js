import BN from 'bn.js'
import bs58 from 'bs58'
import { toBuffer } from 'eth-util-lite'
import { Contract as NearContract } from 'near-api-js'
import { borshifyOutcomeProof } from './borshify-proof'
import { COMPLETE, FAILED, SUCCESS } from '../statuses'
import * as storage from '../storage'

// Call contract given by `nep21Address` to withdraw (burn) the given `amount`
// of NEP21 tokens for window.nearUserAddress. The raw transaction info is
// returned. This info is then used in `checkStatus` to derive the proof needed
// for releasing `amount` tokens to window.ethUserAddress on Ethereum.
export async function initiate (nep21Address, amount) {
  const bridgeToken = new NearContract(
    window.nearConnection.account(),
    nep21Address,
    { changeMethods: ['withdraw'] }
  )

  // TODO: can cause redirect to NEAR Wallet, rendering `tx` inaccessible!
  const tx = await bridgeToken.withdraw(
    {
      amount: String(amount),
      recipient: window.ethUserAddress.replace('0x', '')
    },
    new BN('3' + '0'.repeat(14)) // 10x current default from near-api-js
  )

  const receiptIds = tx.transaction_outcome.outcome.receipt_ids

  if (receiptIds.length !== 1) {
    throw new Error(
      `Withdrawal expects only one receipt, got ${receiptIds.length}. Full withdrawal transaction: ${
        JSON.stringify(tx)
      }`
    )
  }

  const txReceiptId = receiptIds[0]

  const successReceiptId = tx.receipts_outcome
    .find(r => r.id === txReceiptId).outcome.status.SuccessReceiptId
  const txReceiptBlockHash = tx.receipts_outcome
    .find(r => r.id === successReceiptId).block_hash

  const receiptBlock = await window.nearConnection.provider.block({
    blockId: txReceiptBlockHash
  })

  return {
    nep21Address,
    status: WITHDRAWN,
    withdrawReceiptId: successReceiptId,
    withdrawReceiptBlockHeight: Number(receiptBlock.header.height),

    // TODO: remove the below, only adding them for debugging
    withdrawTx: tx,
    withdrawTxReceiptId: txReceiptId // is this different than withdrawReceiptId aka successReceiptId?
  }
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer)
}

export async function checkStatus (transfer) {
  if (transfer.status === WITHDRAWN) {
    try {
      const outcomeBlock = await findOutcomeBlock(transfer)
      if (outcomeBlock) {
        transfer = storage.update(transfer, {
          ...outcomeBlock,
          status: FOUND_OUTCOME
        })
      }
    } catch (error) {
      transfer = storage.update(transfer, {
        status: COMPLETE,
        outcome: FAILED,
        failedAt: WITHDRAWN,
        error: error
      })
    }
  }

  if (transfer.status === FOUND_OUTCOME) {
    try {
      const ethBlockInfo = await findEthBlock(transfer)
      if (ethBlockInfo) {
        transfer = storage.update(transfer, {
          ...ethBlockInfo,
          status: FOUND_ETH_BLOCK
        })
      }
    } catch (error) {
      transfer = storage.update(transfer, {
        status: COMPLETE,
        outcome: FAILED,
        failedAt: FOUND_OUTCOME,
        error: error
      })
    }
  }

  if (transfer.status === FOUND_ETH_BLOCK) {
    try {
      const securityWindowClosed = await checkSecurityWindowClosed(transfer)
      if (securityWindowClosed) {
        transfer = storage.update(transfer, {
          status: SECURITY_WINDOW_CLOSED
        })
      }
    } catch (error) {
      transfer = storage.update(transfer, {
        status: COMPLETE,
        outcome: FAILED,
        failedAt: FOUND_ETH_BLOCK,
        error: error
      })
    }
  }

  if (transfer.status === SECURITY_WINDOW_CLOSED) {
    try {
      await unlock(transfer)
      transfer = storage.update(transfer, {
        outcome: SUCCESS,
        status: COMPLETE
      })
    } catch (error) {
      transfer = storage.update(transfer, {
        status: COMPLETE,
        outcome: FAILED,
        failedAt: SECURITY_WINDOW_CLOSED,
        error: error.message
      })
    }
  }

  return transfer
}

export async function retry (transfer) {
  switch (transfer.status) {
    case SECURITY_WINDOW_CLOSED:
      try {
        await unlock(transfer)
        transfer = storage.update(transfer, {
          outcome: SUCCESS,
          status: COMPLETE
        })
      } catch (error) {
        transfer = storage.update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: SECURITY_WINDOW_CLOSED,
          error: error.message
        })
      }
      break
    default:
      console.log(`Nothing special to do for bridgedNep21ToErc20 transfer that failed at ${transfer.status}`)
  }
}

// custom statuses
const WITHDRAWN = 'withdrawn'
const FOUND_OUTCOME = 'found-outcome'
const FOUND_ETH_BLOCK = 'found-eth-block'
const SECURITY_WINDOW_CLOSED = 'security-window-closed'

// statuses used in humanStatusFor.
// Might be internationalized or moved to separate library in the future.
const statusMessages = {
  [WITHDRAWN]: () => 'finalizing NEAR withdrawal',
  [FOUND_OUTCOME]: () => 'waiting for NEAR withdrawal to appear in Ethereum',
  [FOUND_ETH_BLOCK]: () =>
    'awaiting 4 hour security window; ?/240 minutes passed',
  [SECURITY_WINDOW_CLOSED]: () => 'unlocking in Ethereum',
  [COMPLETE]: ({ outcome, error }) => outcome === SUCCESS ? 'Success!' : error
}

// find block that contains transfer.withdrawTx
async function findOutcomeBlock ({ withdrawReceiptBlockHeight }) {
  // Now wait for a final block with a strictly greater height. This block
  // (or one of its ancestors) should hold the outcome. although
  // TODO: support sharding
  const outcomeBlock = await window.nearConnection.provider.block({
    finality: 'final'
  })

  if (Number(outcomeBlock.header.height) <= withdrawReceiptBlockHeight) {
    return null
  }

  return {
    outcomeBlockHeight: Number(outcomeBlock.header.height)
  }
}

// Wait for the block with the given receipt/transaction in Near2EthClient, and
// get the outcome proof only use block merkle root that we know is available
// on the Near2EthClient.
// Relies on:
//   * window.nearOnEthClient
//   * window.nearConnection
//   * window.nearUserAddress
async function findEthBlock ({
  nep21Address,
  outcomeBlockHeight,
  withdrawReceiptId
}) {
  const { currentHeight } = await window.nearOnEthClient.methods.bridgeState().call()
  const clientBlockHeight = Number(currentHeight)

  if (clientBlockHeight <= outcomeBlockHeight) {
    return null
  }

  const clientBlockHashB58 = bs58.encode(
    toBuffer(
      await window.nearOnEthClient.methods.blockHashes(clientBlockHeight).call()
    )
  )

  const proof = await window.nearConnection.provider.sendJsonRpc(
    'light_client_proof',
    {
      type: 'receipt',
      receipt_id: withdrawReceiptId,
      // TODO: Use proper sender.
      receiver_id: window.nearUserAddress,
      light_client_head: clientBlockHashB58
    }
  )

  return {
    clientBlockHashB58,
    clientBlockHeight,
    proof
  }
}

// A security window is provided for a watchdog service to falsify info passed to ethProver
// This function checks if it has closed
async function checkSecurityWindowClosed () {
  // TODO: check 4hr window progress
  return true
}

// Unlock tokens stored in ethTokenLocker, passing the proof that the tokens
// were withdrawn/burned in the corresponding NEAR BridgeToken contract.
// Relies on:
//   * window.ethProver
//   * window.ethTokenLocker
//   * window.ethUserAddress
async function unlock ({ proof, clientBlockHeight }) {
  const borshProofRes = borshifyOutcomeProof(proof)
  clientBlockHeight = new BN(clientBlockHeight)

  const proveOutcomeTx = await window.ethProver.methods
    .proveOutcome(borshProofRes, clientBlockHeight)
    .call()

  const unlockTokenTx = await window.ethTokenLocker.methods
    .unlockToken(borshProofRes, clientBlockHeight)
    .send()

  return { proveOutcomeTx, unlockTokenTx }
}
