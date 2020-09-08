import Tree from 'merkle-patricia-tree'
import BN from 'bn.js'
import { encode } from 'eth-util-lite'
import { Header, Proof, Receipt, Log } from 'eth-object'
import { promisfy } from 'promisfy'
import * as localStorage from './localStorage'
import { ulid } from 'ulid'
import utils from 'ethereumjs-util'

function getKey () {
  return `${window.ethUserAddress}-to-${window.nearUserAddress}`
}

function getRaw () {
  return localStorage.get(getKey()) || {}
}

// return an array of chronologically-ordered transfers
export function get () {
  const raw = getRaw()
  console.log({ raw })
  return Object.keys(raw).sort().map(id => raw[id])
}

const INITIATED = 'initiated'
const LOCKED = 'event_emitted'
const SUCCESS = 'success'

const statusMessages = {
  [INITIATED]: () => 'locking',
  [LOCKED]: (progress) => `${progress}/25 blocks synced`,
  [SUCCESS]: () => 'succeeded'
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer.progress)
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

export async function initiate (amount, callback) {
  window.erc20.methods.approve(process.env.ethLockerAddress, amount).send()
    .on('transactionHash', () => {
      track({ amount }, callback)
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
    log_entry_data: Log.fromWeb3(log).serialize(),
    receipt_index: proof.txIndex,
    receipt_data: Receipt.fromWeb3(receipt).serialize(),
    header_data: proof.header_rlp,
    proof: Array.from(proof.receiptProof).map(utils.rlp.encode)
  }
}

// check the status of a single transfer
// if `callback` is provided:
//   * it will be called after updating the status in localStorage
//   * a new call to checkStatus will be scheduled for this transfer, if its status is not SUCCESS
async function checkStatus (id, callback) {
  let transfer = getRaw()[id]

  if (transfer.status === INITIATED) {
    const lock = await window.tokenLocker.methods
      .lockToken(transfer.amount, window.nearUserAddress).send()

    transfer = update(transfer, { status: LOCKED, progress: 0, lock })
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
      console.log({ isSafe })
      if (isSafe) {
        await window.nep21.mint(
          await findProof(transfer),
          new BN('300000000000000'),
          // We need to attach tokens because minting increases the contract state, by <600 bytes, which
          // requires an additional 0.06 NEAR to be deposited to the account for state staking.
          // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
          new BN('100000000000000000000').mul(new BN('600'))
        )
        transfer = update(transfer, { status: SUCCESS })
      }
    }
  }

  // if successfully transfered, call callback and end
  if (transfer.status === SUCCESS) {
    if (callback) await callback()
    return
  }

  // if not fully transferred and callback passed in, check status again soon
  if (callback) {
    await callback()
    window.setTimeout(() => checkStatus(transfer.id, callback), 5000)
  }
}

export async function checkStatuses (callback) {
  const inFlight = get().filter(t => t.status !== SUCCESS)

  // if all transfers successful, nothing to do
  if (!inFlight.length) return

  // Check & update statuses for all in parallel.
  // Do not pass callback, only call it once after all updated.
  await Promise.all(inFlight.map(t => checkStatus(t.id)))

  if (callback) await callback()

  // recheck status again soon
  window.setTimeout(() => checkStatuses(callback), 5000)
}
