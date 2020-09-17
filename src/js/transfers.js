import Tree from 'merkle-patricia-tree'
import BN from 'bn.js'
import { encode } from 'eth-util-lite'
import { Header, Proof, Receipt, Log } from 'eth-object'
import { promisfy } from 'promisfy'
import * as localStorage from './localStorage'
import { ulid } from 'ulid'
import utils from 'ethereumjs-util'
import * as urlParams from './urlParams'
import getRevertReason from 'eth-revert-reason'

// return an array of chronologically-ordered transfers
export function get () {
  const raw = getRaw()
  return Object.keys(raw).sort().reduce(
    (acc, id) => {
      const transfer = raw[id]

      if (transfer.status === 'complete') acc.complete.push(transfer)
      else acc.inProgress.push(transfer)

      return acc
    },
    { inProgress: [], complete: [] }
  )
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer)
}

export async function initiate (amount, callback) {
  const approvalHash = await initiateApproval(amount)
  track({ amount, status: INITIATED_APPROVAL, approvalHash }, callback)
}

export function clear (id) {
  const transfers = getRaw()
  delete transfers[id]
  localStorage.set(STORAGE_KEY, transfers)
}

export async function checkStatuses (callback) {
  // First, check if we've just returned to this page from NEAR Wallet after
  // completing a transfer. Do this outside of main Promise.all to
  //
  //   1. avoid race conditions
  //   2. check retried failed transfers, which are not inProgress
  const { minting, balanceBefore } = urlParams.get('minting', 'balanceBefore')
  if (minting) {
    const transfer = getRaw()[minting]
    if (transfer) {
      const balanceAfter = Number(
        await window.nep21.get_balance({ owner_id: window.nearUserAddress })
      )
      if (balanceAfter - transfer.amount === Number(balanceBefore)) {
        update(transfer, { status: COMPLETE, outcome: SUCCESS })
      } else {
        update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: LOCKED,
          error: `Minting ${'n' + window.ethErc20Name} failed`
        })
      }
    }
    urlParams.clear('minting', 'balanceBefore')
    if (callback) await callback()
  }

  const { inProgress } = get()

  // if all transfers successful, nothing to do
  if (!inProgress.length) return

  // Check & update statuses for all in parallel.
  // Do not pass callback, only call it once after all updated.
  await Promise.all(inProgress.map(t => checkStatus(t.id)))

  if (callback) await callback()

  // recheck status again soon
  window.setTimeout(() => checkStatuses(callback), 5500)
}

export async function retry (id, callback) {
  let transfer = getRaw()[id]

  transfer = update(transfer, {
    status: transfer.failedAt,
    outcome: null,
    error: null,
    failedAt: null
  })

  switch (transfer.status) {
    case INITIATED_APPROVAL:
      update(transfer, {
        approvalHash: await initiateApproval(transfer.amount)
      })
      break
    case INITIATED_LOCK:
      update(transfer, {
        lockHash: await initiateLock(transfer.amount)
      })
      break
    case LOCKED:
      mint(transfer)
      break
    default:
      alert(`Do not know how to retry transfer that failed at ${transfer.status} 😞`)
  }

  if (callback) await callback()
  checkStatus(id, callback)
}

async function mint (transfer) {
  const balanceBefore = Number(
    await window.nep21.get_balance({ owner_id: window.nearUserAddress })
  )
  urlParams.set({ minting: transfer.id, balanceBefore })

  const proof = await findProof(transfer)

  await window.nep21.mint_with_json(
    { proof },
    new BN('300000000000000'),
    // We need to attach tokens because minting increases the contract state, by <600 bytes, which
    // requires an additional 0.06 NEAR to be deposited to the account for state staking.
    // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
    new BN('100000000000000000000').mul(new BN('600'))
  )
}

const STORAGE_KEY = 'rainbow-bridge-transfers'

function getRaw () {
  return localStorage.get(STORAGE_KEY) || {}
}

const INITIATED_APPROVAL = 'initiated_approval'
const INITIATED_LOCK = 'initiated_lock'
const LOCKED = 'locked'
const COMPLETE = 'complete'
const SUCCESS = 'success'
const FAILED = 'failed'

const statusMessages = {
  [INITIATED_APPROVAL]: () => 'approving TokenLocker',
  [INITIATED_LOCK]: () => 'locking',
  [LOCKED]: ({ progress }) => `${progress}/25 blocks synced`,
  [COMPLETE]: ({ outcome, error }) => outcome === SUCCESS ? 'Success!' : error
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates after a pause.
async function track (transferRaw, callback) {
  const id = ulid()
  const transfer = { id, ...transferRaw }

  localStorage.set(STORAGE_KEY, { ...getRaw(), [id]: transfer })

  if (callback) await callback()
  checkStatus(id, callback)
}

function update (transfer, withData) {
  const updatedTransfer = { ...transfer, ...withData }
  localStorage.set(STORAGE_KEY, {
    ...getRaw(),
    [transfer.id]: updatedTransfer
  })
  return updatedTransfer
}

async function buildTrie (block) {
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

async function findProof (transfer) {
  const receipt = await window.web3.eth.getTransactionReceipt(transfer.lockReceipt.transactionHash)
  const block = await window.web3.eth.getBlock(transfer.lockReceipt.blockNumber)
  const tree = await buildTrie(block)
  const proof = await extractProof(
    block,
    tree,
    receipt.transactionIndex
  )

  const [lockedEvent] = await window.tokenLocker.getPastEvents('Locked', {
    filter: { transactionHash: transfer.lockHash },
    fromBlock: transfer.lockReceipt.blockNumber
  })
  // `log.logIndex` does not necessarily match the log's order in the array of logs
  const logIndexInArray = receipt.logs.findIndex(
    l => l.logIndex === lockedEvent.logIndex
  )
  const log = receipt.logs[logIndexInArray]

  return {
    log_index: logIndexInArray,
    log_entry_data: Array.from(Log.fromWeb3(log).serialize()),
    receipt_index: proof.txIndex,
    receipt_data: Array.from(Receipt.fromWeb3(receipt).serialize()),
    header_data: Array.from(proof.header_rlp),
    proof: Array.from(proof.receiptProof).map(utils.rlp.encode).map(b => Array.from(b))
  }
}

function initiateApproval (amount) {
  return new Promise((resolve, reject) => {
    window.erc20.methods
      .approve(process.env.ethLockerAddress, amount).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })
}

function initiateLock (amount) {
  return new Promise((resolve, reject) => {
    window.tokenLocker.methods
      .lockToken(amount, window.nearUserAddress).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })
}

// check the status of a single transfer
// if `callback` is provided:
//   * it will be called after updating the status in localStorage
//   * a new call to checkStatus will be scheduled for this transfer, if its status is not SUCCESS
async function checkStatus (id, callback) {
  let transfer = getRaw()[id]

  if (transfer.status === INITIATED_APPROVAL) {
    const approvalReceipt = await window.web3.eth.getTransactionReceipt(
      transfer.approvalHash
    )

    // blockHash is null if tx still pending
    if (approvalReceipt) {
      if (approvalReceipt.status) {
        const lockHash = await initiateLock(transfer.amount)
        transfer = update(transfer, {
          status: INITIATED_LOCK,
          approvalReceipt,
          lockHash
        })
      } else {
        const error = await getRevertReason(
          transfer.approvalHash, process.env.ethNetwork
        )
        transfer = update(transfer, {
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
        transfer = update(transfer, {
          status: LOCKED,
          progress: 0,
          lockReceipt
        })
      } else {
        const error = await getRevertReason(
          transfer.lockHash, process.env.ethNetwork
        )
        transfer = update(transfer, {
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
    const syncedTo = (await window.ethOnNearClient.last_block_number()).toNumber()
    const progress = Math.max(0, syncedTo - eventEmittedAt)
    transfer = update(transfer, { progress })

    if (progress >= 25) {
      // Copying rainbow-bridge-lib, but...
      // Why should EthOnNearClient decide what's safe?
      // Shouldn't MintableFungibleToken enforce this?
      // And a frontend set expectations accordingly?
      // What's the point of this block_hash_safe call??
      const isSafe = await window.ethOnNearClient.block_hash_safe(transfer.lockReceipt.blockNumber)
      if (isSafe) {
        try {
          await mint(transfer)
        } catch (error) {
          console.error(error)
          transfer = update(transfer, {
            status: COMPLETE,
            outcome: FAILED,
            failedAt: LOCKED,
            error: error.message
          })
        }
      }
    }
  }

  // if successfully transfered, call callback and end
  if (transfer.status === COMPLETE) {
    if (callback) await callback()
    return
  }

  // if not fully transferred and callback passed in, check status again soon
  if (callback) {
    await callback()
    window.setTimeout(() => checkStatus(transfer.id, callback), 5500)
  }
}
