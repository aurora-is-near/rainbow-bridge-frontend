import Tree from 'merkle-patricia-tree'
import BN from 'bn.js'
import { encode } from 'eth-util-lite'
import { Header, Proof, Receipt, Log } from 'eth-object'
import { promisfy } from 'promisfy'
import * as localStorage from './localStorage'
import { ulid } from 'ulid'
import utils from 'ethereumjs-util'
import * as urlParams from './urlParams'

function getKey () {
  return `${window.ethUserAddress}-to-${window.nearUserAddress}`
}

function getRaw () {
  return localStorage.get(getKey()) || {}
}

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

const INITIATED = 'initiated'
const LOCKED = 'event_emitted'
const COMPLETE = 'complete'
const SUCCESS = 'success'
const FAILED = 'failed'

const statusMessages = {
  [INITIATED]: () => 'locking',
  [LOCKED]: ({ progress }) => `${progress}/25 blocks synced`,
  [COMPLETE]: ({ outcome, error }) => outcome === SUCCESS ? 'Success!' : error
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer)
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates after a pause.
async function track (transferRaw, callback) {
  const id = ulid()
  const transfer = { id, status: INITIATED, ...transferRaw }

  localStorage.set(getKey(), { ...getRaw(), [id]: transfer })

  if (callback) await callback()
  checkStatus(id, callback)
}

function update (transfer, withData) {
  const updatedTransfer = { ...transfer, ...withData }
  localStorage.set(getKey(), {
    ...getRaw(),
    [transfer.id]: updatedTransfer
  })
  return updatedTransfer
}

export function initiate (amount, callback) {
  return new Promise((resolve, reject) => {
    window.erc20.methods.approve(process.env.ethLockerAddress, amount).send()
      .on('transactionHash', hash => {
        resolve(hash)
        track({ amount }, callback)
      })
      .catch(reject)
  })
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
  const receipt = await window.web3.eth.getTransactionReceipt(transfer.lock.transactionHash)
  const block = await window.web3.eth.getBlock(transfer.lock.blockNumber)
  const tree = await buildTrie(block)
  const proof = await extractProof(
    block,
    tree,
    receipt.transactionIndex
  )

  const log = receipt.logs.find(l => l.logIndex === transfer.lock.events.Locked.logIndex)

  return {
    log_index: transfer.lock.events.Locked.logIndex,
    log_entry_data: Array.from(Log.fromWeb3(log).serialize()),
    receipt_index: proof.txIndex,
    receipt_data: Array.from(Receipt.fromWeb3(receipt).serialize()),
    header_data: Array.from(proof.header_rlp),
    proof: Array.from(proof.receiptProof).map(utils.rlp.encode).map(b => Array.from(b))
  }
}

// check the status of a single transfer
// if `callback` is provided:
//   * it will be called after updating the status in localStorage
//   * a new call to checkStatus will be scheduled for this transfer, if its status is not SUCCESS
async function checkStatus (id, callback) {
  let transfer = getRaw()[id]

  // First, check if we've just returned to this page from NEAR Wallet after
  // completing this transfer
  const { minting, balanceBefore } = urlParams.get('minting', 'balanceBefore')
  if (minting && id === minting) {
    const balanceAfter = Number(
      await window.nep21.get_balance({ owner_id: window.nearUserAddress })
    )
    if (balanceAfter - transfer.amount === Number(balanceBefore)) {
      transfer = update(transfer, { status: COMPLETE, outcome: SUCCESS })
    } else {
      transfer = update(transfer, {
        status: COMPLETE,
        outcome: FAILED,
        error: `Minting ${process.env.nearNep21Name} failed`
      })
    }
    urlParams.clear('minting', 'balanceBefore')
  }

  if (transfer.status === INITIATED) {
    try {
      // TODO only await transactionHash here, then look up transaction (and
      // receipt?) in follow-up step
      // This takes a long time and the user could navigate away/refresh the
      // page before it completes, triggering a duplicate "lock" call on the
      // next page load, which would never complete
      const lock = await window.tokenLocker.methods
        .lockToken(transfer.amount, window.nearUserAddress).send()

      transfer = update(transfer, { status: LOCKED, progress: 0, lock })
    } catch (error) {
      console.error(error)
      transfer = update(transfer, { status: COMPLETE, outcome: FAILED, error })
    }
  }

  if (transfer.status === LOCKED) {
    const eventEmittedAt = transfer.lock.blockNumber
    const syncedTo = (await window.ethOnNearClient.last_block_number()).toNumber()
    const progress = Math.max(0, syncedTo - eventEmittedAt)
    transfer = update(transfer, { progress })

    if (progress >= 25) {
      // Copying rainbow-bridge-lib, but...
      // Why should EthOnNearClient decide what's safe?
      // Shouldn't MintableFungibleToken enforce this?
      // And a frontend set expectations accordingly?
      // What's the point of this block_hash_safe call??
      const isSafe = await window.ethOnNearClient.block_hash_safe(transfer.lock.blockNumber)
      if (isSafe) {
        const balanceBefore = Number(
          await window.nep21.get_balance({ owner_id: window.nearUserAddress })
        )
        urlParams.set({ minting: transfer.id, balanceBefore })
        try {
          await window.nep21.mint_with_json(
            { proof: await findProof(transfer) },
            new BN('300000000000000'),
            // We need to attach tokens because minting increases the contract state, by <600 bytes, which
            // requires an additional 0.06 NEAR to be deposited to the account for state staking.
            // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
            new BN('100000000000000000000').mul(new BN('600'))
          )
        } catch (error) {
          console.error(error)
          transfer = update(transfer, { status: COMPLETE, outcome: FAILED, error })
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
    window.setTimeout(() => checkStatus(transfer.id, callback), 6000)
  }
}

export async function checkStatuses (callback) {
  const { inProgress } = get()

  // if all transfers successful, nothing to do
  if (!inProgress.length) return

  // Check & update statuses for all in parallel.
  // Do not pass callback, only call it once after all updated.
  await Promise.all(inProgress.map(t => checkStatus(t.id)))

  if (callback) await callback()

  // recheck status again soon
  window.setTimeout(() => checkStatuses(callback), 6000)
}
