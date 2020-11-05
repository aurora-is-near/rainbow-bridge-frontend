import Tree from 'merkle-patricia-tree'
import BN from 'bn.js'
import { encode } from 'eth-util-lite'
import { Header, Proof, Receipt, Log } from 'eth-object'
import { promisfy } from 'promisfy'
import utils from 'ethereumjs-util'
import getRevertReason from 'eth-revert-reason'
import { Contract as NearContract } from 'near-api-js'
import { serialize as serializeBorsh } from 'near-api-js/lib/utils/serialize'
import { getErc20Name } from '../ethHelpers'
import {
  Proof as BorshProof,
  schema as proofBorshSchema
} from '../borsh/mintableTokenFactory'
import * as urlParams from '../urlParams'
import * as storage from './storage'
import { COMPLETE, FAILED, LOCKED, SUCCESS } from './statuses'

// Call contract given by `erc20` contract, requesting
// permission for window.ethTokenLocker to transfer 'amount' tokens
// on behalf of the default erc20 user set up in authEthereum.js.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
export async function initiate (erc20, amount) {
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    erc20,
    { from: window.ethUserAddress }
  )

  const approvalHash = await new Promise((resolve, reject) => {
    erc20Contract.methods
      .approve(process.env.ethLockerAddress, amount).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })

  return {
    approvalHash,
    erc20Address: erc20,
    erc20Name: await getErc20Name(erc20),
    // currently hard-coding neededConfirmations until MintableFungibleToken is
    // updated with this information
    status: INITIATED_APPROVAL
  }
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer)
}

export async function checkStatus (transfer) {
  if (transfer.status === INITIATED_APPROVAL) {
    const approvalReceipt = await window.web3.eth.getTransactionReceipt(
      transfer.approvalHash
    )

    if (approvalReceipt) {
      if (approvalReceipt.status) {
        const lockHash = await initiateLock(transfer.erc20Address, transfer.amount)
        transfer = storage.update(transfer, {
          status: INITIATED_LOCK,
          approvalReceipt,
          lockHash
        })
      } else {
        const error = await getRevertReason(
          transfer.approvalHash, process.env.ethNetwork
        )
        transfer = storage.update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: INITIATED_APPROVAL,
          error,
          approvalReceipt
        })
      }
    }
  }

  if (transfer.status === INITIATED_LOCK) {
    const lockReceipt = await window.web3.eth.getTransactionReceipt(
      transfer.lockHash
    )

    if (lockReceipt) {
      if (lockReceipt.status) {
        transfer = storage.update(transfer, {
          status: LOCKED,
          progress: 0,
          lockReceipt
        })
      } else {
        const error = await getRevertReason(
          transfer.lockHash, process.env.ethNetwork
        )
        transfer = storage.update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: INITIATED_LOCK,
          error,
          lockReceipt
        })
      }
    }
  }

  if (transfer.status === LOCKED) {
    const eventEmittedAt = transfer.lockReceipt.blockNumber
    const syncedTo = await window.ethOnNearClient.lastBlockNumber()
    const progress = Math.max(0, syncedTo - eventEmittedAt)
    transfer = storage.update(transfer, { progress })

    if (progress >= transfer.neededConfirmations) {
      try {
        await mint(transfer)
      } catch (error) {
        console.error(error)
        transfer = storage.update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: LOCKED,
          error: error.message
        })
      }
    }
  }

  return transfer
}

export async function checkCompletion (transfer) {
  const balanceBefore = urlParams.get('balanceBefore')
  const balanceAfter = Number(
    await getNep21Balance(transfer.erc20Address)
  )
  if (balanceAfter - transfer.amount === Number(balanceBefore)) {
    storage.update(transfer, { status: COMPLETE, outcome: SUCCESS })
  } else {
    storage.update(transfer, {
      status: COMPLETE,
      outcome: FAILED,
      failedAt: LOCKED,
      error: `Minting ${'n' + transfer.erc20Name} failed`
    })
  }
}

export async function retry (transfer) {
  switch (transfer.status) {
    case INITIATED_APPROVAL: {
      const oldApprovalHashes = transfer.oldApprovalHashes || []
      oldApprovalHashes.push(transfer.approvalHash)
      const { approvalHash } = await initiate(transfer.erc20Address, transfer.amount)
      transfer = storage.update(transfer, { oldApprovalHashes, approvalHash })
      break
    }
    case INITIATED_LOCK: {
      // TODO: re-check previous lock attempt. Maybe it worked now?
      const oldLockHashes = transfer.oldLockHashes || []
      oldLockHashes.push(transfer.lockHash)
      const lockHash = await initiateLock(transfer.erc20Address, transfer.amount)
      transfer = transfer.update(transfer, { oldLockHashes, lockHash })
      break
    }
    case LOCKED:
      mint(transfer)
      break
    default:
      alert(`Do not know how to retry naturalErc20ToNep21 transfer that failed at ${transfer.status} 😞`)
  }
}

// custom statuses
const INITIATED_APPROVAL = 'initiated_approval'
const INITIATED_LOCK = 'initiated_lock'

// statuses used in humanStatusFor.
// Might be internationalized or moved to separate library in the future.
const statusMessages = {
  [INITIATED_APPROVAL]: () => 'approving TokenLocker',
  [INITIATED_LOCK]: () => 'locking',
  [LOCKED]: ({ progress, neededConfirmations }) =>
    `${progress}/${neededConfirmations} blocks synced`,
  [COMPLETE]: ({ outcome, error }) => outcome === SUCCESS ? 'Success!' : error
}

async function getNep21Balance (erc20Address) {
  const nep21Address =
    erc20Address.replace('0x', '').toLowerCase() +
    '.' +
    process.env.nearTokenFactoryAccount

  const nep21 = await new NearContract(
    window.nearConnection.account(),
    nep21Address,
    { viewMethods: ['get_balance'] }
  )

  return nep21.get_balance({ owner_id: window.nearUserAddress })
    .then(raw => Number(raw))
    .catch(() => null)
}

// Call window.ethTokenLocker, locking 'amount' tokens.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
function initiateLock (erc20, amount) {
  return new Promise((resolve, reject) => {
    window.ethTokenLocker.methods
      .lockToken(erc20, amount, window.nearUserAddress).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })
}

// Mint NEP21 tokens to window.nearUserAddress after successfully locking them
// in window.ethTokenLocker and waiting for neededConfirmations to propogate into
// window.ethOnNearClient
async function mint (transfer) {
  const balanceBefore = Number(
    await getNep21Balance(transfer.erc20Address)
  )
  urlParams.set({ minting: transfer.id, balanceBefore })

  const proof = await findProof(transfer)

  await window.nearFungibleTokenFactory.deposit(
    serializeBorsh(proofBorshSchema, proof),
    new BN('300000000000000'),
    // We need to attach tokens because minting increases the contract state, by <600 bytes, which
    // requires an additional 0.06 NEAR to be deposited to the account for state staking.
    // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
    new BN('100000000000000000000').mul(new BN('600'))
  )
}

// Compute proof that Locked event was fired in Ethereum. This proof can then
// be passed to the FungibleTokenFactory contract, which verifies the proof
// against a Prover contract.
async function findProof (transfer) {
  const receipt = await window.web3.eth.getTransactionReceipt(transfer.lockReceipt.transactionHash)
  const block = await window.web3.eth.getBlock(transfer.lockReceipt.blockNumber)
  const tree = await buildTree(block)
  const proof = await extractProof(
    block,
    tree,
    receipt.transactionIndex
  )

  const [lockedEvent] = await window.ethTokenLocker.getPastEvents('Locked', {
    filter: { transactionHash: transfer.lockHash },
    fromBlock: transfer.lockReceipt.blockNumber
  })
  // `log.logIndex` does not necessarily match the log's order in the array of logs
  const logIndexInArray = receipt.logs.findIndex(
    l => l.logIndex === lockedEvent.logIndex
  )
  const log = receipt.logs[logIndexInArray]

  return new BorshProof({
    log_index: logIndexInArray,
    log_entry_data: Array.from(Log.fromWeb3(log).serialize()),
    receipt_index: proof.txIndex,
    receipt_data: Array.from(Receipt.fromWeb3(receipt).serialize()),
    header_data: Array.from(proof.header_rlp),
    proof: Array.from(proof.receiptProof).map(utils.rlp.encode).map(b => Array.from(b))
  })
}

async function buildTree (block) {
  const blockReceipts = await Promise.all(
    block.transactions.map(t => window.web3.eth.getTransactionReceipt(t))
  )

  // Build a Patricia Merkle Trie
  const tree = new Tree()
  await Promise.all(
    blockReceipts.map(receipt => {
      const path = encode(receipt.transactionIndex)
      const serializedReceipt = Receipt.fromWeb3(receipt).serialize()
      return promisfy(tree.put, tree)(path, serializedReceipt)
    })
  )

  return tree
}

async function extractProof (block, tree, transactionIndex) {
  const [, , stack] = await promisfy(
    tree.findPath,
    tree
  )(encode(transactionIndex))

  const blockData = await window.web3.eth.getBlock(block.number)
  // Correctly compose and encode the header.
  const header = Header.fromWeb3(blockData)
  return {
    header_rlp: header.serialize(),
    receiptProof: Proof.fromStack(stack),
    txIndex: transactionIndex
  }
}
