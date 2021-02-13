import BN from 'bn.js'
import bs58 from 'bs58'
import getRevertReason from 'eth-revert-reason'
import { toBuffer } from 'eth-util-lite'
import { parseRpcError } from 'near-api-js/lib/utils/rpc_errors'
import getErc20Name from '../../natural-erc20/getName'
import * as status from '../../../statuses'
import { stepsFor } from '../../../i18nHelpers'
import { track } from '../../..'
import { borshifyOutcomeProof } from './borshify-proof'
import { checkNearAuth, userAuthedAgainst } from '../../utils'
import getNep141Address from '../getAddress'

export const SOURCE_NETWORK = 'near'
export const DESTINATION_NETWORK = 'ethereum'
export const TRANSFER_TYPE = '@near~eth/nep141~erc20/bridged-nep141/sendToEthereum'

const WITHDRAW = 'withdraw-bridged-nep141-to-erc20'
const AWAIT_FINALITY = 'await-finality-bridged-nep141-to-erc20'
const SYNC = 'sync-bridged-nep141-to-erc20'
const UNLOCK = 'unlock-bridged-nep141-to-erc20'

const steps = [
  WITHDRAW,
  AWAIT_FINALITY,
  SYNC,
  UNLOCK
]

export const i18n = {
  en_US: {
    steps: transfer => stepsFor(transfer, steps, {
      [WITHDRAW]: `Withdraw ${transfer.amount} ${transfer.sourceTokenName} from NEAR`,
      [AWAIT_FINALITY]: 'Await NEAR finality for withdrawal transaction',
      [SYNC]: 'Sync withdrawal transaction to Ethereum',
      [UNLOCK]: `Unlock ${transfer.amount} ${transfer.destinationTokenName} in Ethereum`
    }),
    statusMessage: transfer => {
      if (transfer.status === status.FAILED) return 'Failed'
      if (transfer.status === status.ACTION_NEEDED) {
        switch (transfer.completedStep) {
          case null: return 'Ready to withdraw from NEAR'
          case SYNC: return 'Ready to unlock in Ethereum'
        }
      }
      switch (transfer.completedStep) {
        case null: return 'Withdrawing from NEAR'
        case WITHDRAW: return 'Finalizing withdrawal'
        case AWAIT_FINALITY: return 'Syncing to Ethereum'
        case SYNC: return 'Unlocking in Ethereum'
        case UNLOCK: return 'Transfer complete'
      }
    },
    callToAction: transfer => {
      if (transfer.status === status.FAILED) return 'Retry'
      if (transfer.status !== status.ACTION_NEEDED) return null
      switch (transfer.completedStep) {
        case null: return 'Withdraw'
        case SYNC: return 'Unlock'
      }
    }
  }
}

// Called when status is ACTION_NEEDED or FAILED
export function act (transfer) {
  switch (transfer.completedStep) {
    case null: return authenticate(transfer)
    case SYNC: return unlock(transfer)
    default: throw new Error(`Don't know how to act on transfer: ${JSON.stringify(transfer)}`)
  }
}

// Called when status is IN_PROGRESS
export function checkStatus (transfer) {
  switch (transfer.completedStep) {
    case null: return withdraw(transfer)
    case WITHDRAW: return checkFinality(transfer)
    case AWAIT_FINALITY: return checkSync(transfer)
    case SYNC: return checkUnlock(transfer)
  }
}

export async function initiate ({
  erc20Address,
  amount,
  sender,
  recipient
}) {
  // TODO: move to core 'decorate'; get both from contracts
  const destinationTokenName = await getErc20Name(erc20Address)
  const sourceTokenName = destinationTokenName + 'ⁿ'
  const sourceToken = getNep141Address(erc20Address)

  // various attributes stored as arrays, to keep history of retries
  const transfer = {
    // attributes common to all transfer types
    amount,
    completedStep: null,
    destinationTokenName,
    errors: [],
    recipient,
    sender,
    sourceToken,
    sourceTokenName,
    status: status.IN_PROGRESS,
    type: TRANSFER_TYPE,

    // attributes specific to bridged-nep141-to-erc20 transfers
    finalityBlockHeights: [],
    finalityBlockTimestamps: [],
    nearOnEthClientBlockHeight: null, // calculated & set to a number during checkSync
    securityWindow: 4 * 60, // in minutes. TODO: seconds instead? hours? TODO: get from connector contract? prover?
    securityWindowProgress: 0,
    unlockHashes: [],
    unlockReceipts: [],
    withdrawReceiptBlockHeights: [],
    withdrawReceiptIds: [],
    nearOnEthClientBlockHeights: [],
    proofs: []
  }

  // no need for checkStatusEvery, because:
  // * the `authenticate`/`withdraw` flow causes a redirect to NEAR Wallet
  // * once back at app, `checkStatusAll` will cover this one
  await track(transfer)

  authenticate(transfer)
}

// current BridgeToken contract does not require deposit on `withdraw` function
// call `requestSignIn` to add FunctionCall Access Key for this contract,
// then once back at this app, can call `withdraw` without firing a redirect to NEAR Wallet.
async function authenticate (transfer) {
  // setTimeout to add access key for BridgeToken contract AFTER returning, so
  // that transfer can be updated in local storage and marked as no longer
  // failing (if needed)
  setTimeout(
    () => checkNearAuth(transfer.sourceToken, { strict: true }),
    50
  )

  return {
    ...transfer,
    status: status.IN_PROGRESS
  }
}

async function withdraw (transfer) {
  // `authenticate` hasn't triggered redirect yet
  if (!(await userAuthedAgainst(transfer.sourceToken))) {
    return transfer
  }
  let withdrawTx
  try {
    withdrawTx = await window.nearConnection.account().functionCall(
      transfer.sourceToken,
      'withdraw',
      {
        amount: String(transfer.amount),
        recipient: transfer.recipient.replace('0x', '')
      },
      new BN('3' + '0'.repeat(14)) // 10x current default from near-api-js
    )
  } catch (e) {
    console.error(e)
    return {
      ...transfer,
      errors: [...transfer.errors, e.message],
      status: status.FAILED
    }
  }

  if (withdrawTx.status.Failure) {
    console.error('withdrawTx.status.Failure', withdrawTx.status.Failure)
    const errorMessage = typeof withdrawTx.status.Failure === 'object'
      ? parseRpcError(withdrawTx.status.Failure)
      : `Transaction <a href="${process.env.nearExplorerUrl}/transactions/${withdrawTx.transaction.hash}">${withdrawTx.transaction.hash}</a> failed`

    return {
      ...transfer,
      errors: [...transfer.errors, errorMessage],
      status: status.FAILED,
      withdrawTx
    }
  }

  const receiptIds = withdrawTx.transaction_outcome.outcome.receipt_ids

  if (receiptIds.length !== 1) {
    return {
      ...transfer,
      errors: [
        ...transfer.errors,
          `Withdrawal expects only one receipt, got ${receiptIds.length
          }. Full withdrawal transaction: ${JSON.stringify(withdrawTx)}`
      ],
      status: status.FAILED,
      withdrawTx
    }
  }

  const txReceiptId = receiptIds[0]

  const successReceiptId = withdrawTx.receipts_outcome
    .find(r => r.id === txReceiptId).outcome.status.SuccessReceiptId
  const txReceiptBlockHash = withdrawTx.receipts_outcome
    .find(r => r.id === successReceiptId).block_hash

  const receiptBlock = await window.nearConnection.account().connection.provider.block({
    blockId: txReceiptBlockHash
  })

  return {
    ...transfer,
    status: status.IN_PROGRESS,
    completedStep: WITHDRAW,
    withdrawReceiptIds: [...transfer.withdrawReceiptIds, successReceiptId],
    withdrawReceiptBlockHeights: [...transfer.withdrawReceiptBlockHeights, Number(receiptBlock.header.height)]
  }
}

// Wait for a final block with a strictly greater height than withdrawTx
// receipt. This block (or one of its ancestors) should hold the outcome.
// Although this may not support sharding.
// TODO: support sharding
async function checkFinality (transfer) {
  const withdrawReceiptBlockHeight = last(transfer.withdrawReceiptBlockHeights)
  const latestFinalizedBlock = Number((
    await window.nearConnection.account().connection.provider.block({ finality: 'final' })
  ).header.height)

  if (latestFinalizedBlock <= withdrawReceiptBlockHeight) {
    return transfer
  }

  return {
    ...transfer,
    completedStep: AWAIT_FINALITY,
    status: status.IN_PROGRESS,
    finalityBlockHeights: [...transfer.finalityBlockHeights, latestFinalizedBlock]
  }
}

// Wait for the block with the given receipt/transaction in Near2EthClient, and
// get the outcome proof only use block merkle root that we know is available
// on the Near2EthClient.
// Relies on:
//   * window.nearOnEthClient
//   * window.nearConnection
async function checkSync (transfer) {
  const finalityBlockHeight = last(transfer.finalityBlockHeights)
  const { currentHeight } = await window.nearOnEthClient.methods.bridgeState().call()
  const nearOnEthClientBlockHeight = Number(currentHeight)

  if (nearOnEthClientBlockHeight <= finalityBlockHeight) {
    return {
      ...transfer,
      nearOnEthClientBlockHeight,
      status: status.IN_PROGRESS
    }
  }

  const clientBlockHashB58 = bs58.encode(toBuffer(
    await window.nearOnEthClient.methods
      .blockHashes(nearOnEthClientBlockHeight).call()
  ))
  const withdrawReceiptId = last(transfer.withdrawReceiptIds)
  const proof = await window.nearConnection.account().connection.provider.sendJsonRpc(
    'light_client_proof',
    {
      type: 'receipt',
      receipt_id: withdrawReceiptId,
      receiver_id: transfer.sender,
      light_client_head: clientBlockHashB58
    }
  )

  return {
    ...transfer,
    completedStep: SYNC,
    nearOnEthClientBlockHeights: [...transfer.nearOnEthClientBlockHeights, nearOnEthClientBlockHeight],
    proofs: [...transfer.proofs, proof],
    status: status.ACTION_NEEDED
  }
}

// Unlock tokens stored in ethTokenLocker, passing the proof that the tokens
// were withdrawn/burned in the corresponding NEAR BridgeToken contract.
// Relies on:
//   * window.ethProver
//   * window.ethTokenLocker
async function unlock (transfer) {
  const borshProof = borshifyOutcomeProof(last(transfer.proofs))
  const nearOnEthClientBlockHeight = new BN(last(transfer.nearOnEthClientBlockHeights))

  // Copied from original core rainbow-bridge repo, but
  // This variable is never used.
  // This uses `call` instead of `send`, so sends no transaction.
  // TODO: Do we need it? Should it use `call`?
  // const proveOutcomeTx = await window.ethProver.methods
  //   .proveOutcome(borshProofRes, nearOnEthClientBlockHeight)
  //   .call()

  const unlockHash = await new Promise((resolve, reject) => {
    window.ethTokenLocker.methods
      .unlockToken(borshProof, nearOnEthClientBlockHeight).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })

  return {
    ...transfer,
    status: status.IN_PROGRESS,
    unlockHashes: [...transfer.unlockHashes, unlockHash]
  }
}

async function checkUnlock (transfer) {
  const unlockHash = last(transfer.unlockHashes)
  const unlockReceipt = await window.web3.eth.getTransactionReceipt(unlockHash)

  if (!unlockReceipt) return transfer

  if (!unlockReceipt.status) {
    let error
    try {
      const ethNetwork = await window.web3.eth.net.getNetworkType()
      error = await getRevertReason(unlockHash, ethNetwork)
    } catch (e) {
      console.error(e)
      error = `Could not determine why transaction failed; encountered error: ${e.message}`
    }
    return {
      ...transfer,
      status: status.FAILED,
      errors: [...transfer.errors, error],
      unlockReceipts: [...transfer.unlockReceipts, unlockReceipt]
    }
  }

  return {
    ...transfer,
    status: status.COMPLETE,
    completedStep: UNLOCK,
    unlockReceipts: [...transfer.unlockReceipts, unlockReceipt]
  }
}

const last = arr => arr[arr.length - 1]
