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
import { serialize as serializeBorsh } from 'near-api-js/lib/utils/serialize'
import {
  Proof as BorshProof,
  schema as proofBorshSchema
} from './borsh/mintableTokenFactory'
import { getErc20Name } from './ethHelpers'

// Initiate a new transfer of 'amount' ERC20 tokens, at address given by
// 'erc20' argument, to NEAR.
//
// Currently depends on many global variables:
//
// * window.web3: constructing a Proof of the `Locked` event currently has deep
//   coupling with the web3.js library. Make initialized library available here.
// * window.tokenLocker: a web3.js `Contract` instance for the TokenLocker
//   contract at address `process.env.ethLockerAddress`
// * window.ethOnNearClient: similar to a near-api-js `Contract` instance, but
//   using a custom wrapper to handle Borsh serialization. See https://borsh.io
//   and the code in ./authNear.js. This will be streamlined and added to
//   near-api-js soon.
// * window.ethUserAddress: address of authenticated Ethereum wallet to send from
// * window.nearUserAddress: address of authenticated NEAR wallet to send to
export async function initiate ({ erc20, nep21FromErc20, amount, callback }) {
  const originsProvided = [
    erc20,
    nep21FromErc20
  ].reduce((n, arg) => n + Number(!!arg), 0)
  if (originsProvided !== 1) {
    throw new Error(`Please provide only one of:
      • erc20: an address of a natural ERC20 to send to NEAR
      • nep21FromErc20: address of an NEP21 to send back to Ethereum
    `)
  }

  if (nep21FromErc20) {
    throw new Error('nep21FromErc20 not yet supported')
  }

  const approvalHash = await initiateApproval({ erc20, amount })
  const transfer = {
    amount,
    erc20Address: erc20,
    erc20Name: await getErc20Name(erc20),
    // currently hard-coding neededConfirmations until MintableFungibleToken is
    // updated with this information
    neededConfirmations: 10,
    status: INITIATED_APPROVAL,
    approvalHash
  }
  track(transfer, callback)
}

// The only way to retrieve a list of transfers.
// Returns an object with 'inProgress' and 'complete' keys,
// and an array of chronologically-ordered transfers for each
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

// Return a human-readable description of the status for a given transfer
export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer)
}

// Check statuses of all inProgress transfers, and update them accordingly.
// Accepts an optional callback, which will be called after all transfers have
// been checked & updated.
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
        await getBalance.erc20ToNep21(transfer.erc20Address)
      )
      if (balanceAfter - transfer.amount === Number(balanceBefore)) {
        update(transfer, { status: COMPLETE, outcome: SUCCESS })
      } else {
        update(transfer, {
          status: COMPLETE,
          outcome: FAILED,
          failedAt: LOCKED,
          error: `Minting ${'n' + transfer.erc20Name} failed`
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

  // recheck statuses again soon
  window.setTimeout(() => checkStatuses(callback), 5500)
}

// Retry a failed transfer
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
        approvalHash: await initiateApproval({
          amount: transfer.amount,
          erc20: transfer.erc20Address
        })
      })
      break
    case INITIATED_LOCK:
      // TODO: re-check previous lock attempt. Maybe it worked now?
      update(transfer, {
        lockHash: await initiateLock({
          amount: transfer.amount,
          erc20: transfer.erc20Address
        })
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

// Clear a transfer from localStorage
export function clear (id) {
  const transfers = getRaw()
  delete transfers[id]
  localStorage.set(STORAGE_KEY, transfers)
}

const STORAGE_KEY = 'rainbow-bridge-transfers'

// Get raw transfers, stored in localStorage as an object indexed by keys
function getRaw () {
  return localStorage.get(STORAGE_KEY) || {}
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates, which, if given a callback, will
// kick off timed re-checks.
async function track (transferRaw, callback) {
  const id = ulid()
  const transfer = { id, ...transferRaw }

  localStorage.set(STORAGE_KEY, { ...getRaw(), [id]: transfer })

  if (callback) await callback()
  checkStatus(id, callback)
}

// transfer statuses & outcomes
const INITIATED_APPROVAL = 'initiated_approval'
const INITIATED_LOCK = 'initiated_lock'
const LOCKED = 'locked'
const COMPLETE = 'complete'
const SUCCESS = 'success'
const FAILED = 'failed'

// statuses used in humanStatusFor.
// Might be internationalized or moved to separate library in the future.
const statusMessages = {
  [INITIATED_APPROVAL]: () => 'approving TokenLocker',
  [INITIATED_LOCK]: () => 'locking',
  [LOCKED]: ({ progress, neededConfirmations }) =>
    `${progress}/${neededConfirmations} blocks synced`,
  [COMPLETE]: ({ outcome, error }) => outcome === SUCCESS ? 'Success!' : error
}

// update a given transfer in localStorage, returning a new object with the
// updated version
function update (transfer, withData) {
  const updatedTransfer = { ...transfer, ...withData }
  localStorage.set(STORAGE_KEY, {
    ...getRaw(),
    [transfer.id]: updatedTransfer
  })
  return updatedTransfer
}

// Call window.erc20, requesting permission for window.tokenLocker to transfer
// 'amount' tokens on behalf of the default erc20 user set up in
// authEthereum.js.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
function initiateApproval ({ erc20, amount }) {
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    erc20,
    { from: window.ethUserAddress }
  )

  return new Promise((resolve, reject) => {
    erc20Contract.methods
      .approve(process.env.ethLockerAddress, amount).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })
}

// Call window.tokenLocker, locking 'amount' tokens.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
function initiateLock ({ erc20, amount }) {
  return new Promise((resolve, reject) => {
    window.tokenLocker.methods
      .lockToken(erc20, amount, window.nearUserAddress).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })
}

// Helpers to get balances for bridged tokens, organized in a way to attempt to
// reduce confusion regarding which exact kind of token you're fetching the
// balance for
const getBalance = {
  erc20ToNep21: async function getBridgedErc20Balance (erc20Address) {
    const nep21Address =
    erc20Address.replace('0x', '').toLowerCase() +
    '.' +
    process.env.nearTokenFactoryAccount

    const nep21 = await new window.NearContract(
      window.nearConnection.account(),
      nep21Address,
      { viewMethods: ['get_balance'] }
    )

    return nep21.get_balance({ owner_id: window.nearUserAddress })
      .then(raw => Number(raw))
      .catch(() => null)
  }
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

    if (approvalReceipt) {
      if (approvalReceipt.status) {
        const lockHash = await initiateLock({
          amount: transfer.amount,
          erc20: transfer.erc20Address
        })
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
    const syncedTo = await window.ethOnNearClient.lastBlockNumber()
    const progress = Math.max(0, syncedTo - eventEmittedAt)
    transfer = update(transfer, { progress })

    if (progress >= transfer.neededConfirmations) {
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

// Mint NEP21 tokens to window.nearUserAddress after successfully locking them
// in window.tokenLocker and waiting for neededConfirmations to propogate into
// window.ethOnNearClient
async function mint (transfer) {
  const balanceBefore = Number(
    await getBalance.erc20ToNep21(transfer.erc20Address)
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

  const [lockedEvent] = await window.tokenLocker.getPastEvents('Locked', {
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
