import BN from 'bn.js'
import getRevertReason from 'eth-revert-reason'
import { Contract as NearContract } from 'near-api-js'
import { getErc20Name } from '../../../utils'
import * as urlParams from '../../../urlParams'
import { stepsFor } from '../../i18nHelpers'
import * as status from '../../statuses'
import { track } from '../..'
import findProof from './findProof'
import { lastBlockNumber } from './ethOnNearClient'

export const SOURCE_NETWORK = 'ethereum'
export const DESTINATION_NETWORK = 'near'

const last = arr => arr[arr.length - 1]

const APPROVE = 'approve-natural-erc20-to-nep21'
const LOCK = 'lock-natural-erc20-to-nep21'
const SYNC = 'sync-natural-erc20-to-nep21'
const MINT = 'mint-natural-erc20-to-nep21'

const steps = [
  APPROVE,
  LOCK,
  SYNC,
  MINT
]

export const i18n = {
  en_US: {
    steps: transfer => stepsFor(transfer, steps, {
      [APPROVE]: `Approve Token Locker to spend ${transfer.amount} ${transfer.sourceTokenName}`,
      [LOCK]: `Lock ${transfer.amount} ${transfer.sourceTokenName} in Token Locker`,
      [SYNC]: `Sync ${transfer.neededConfirmations} blocks from Ethereum to NEAR`,
      [MINT]: `Mint ${transfer.amount} ${transfer.destinationTokenName} in NEAR`
    }),
    statusMessage: transfer => {
      if (transfer.status === status.FAILED) return 'Failed'
      if (transfer.status === status.ACTION_NEEDED) {
        switch (transfer.completedStep) {
          case APPROVE: return 'Ready to lock in Ethereum'
          case SYNC: return 'Ready to mint in NEAR'
        }
      }
      switch (transfer.completedStep) {
        case null: return 'Approving Token Locker'
        case APPROVE: return 'Locking in Ethereum'
        case LOCK: return `Syncing block ${transfer.completedConfirmations + 1}/${transfer.neededConfirmations}`
        case SYNC: return 'Minting in NEAR'
        case MINT: return 'Transfer complete'
      }
    },
    callToAction: transfer => {
      if (transfer.status === status.FAILED) return 'Retry'
      if (transfer.status !== status.ACTION_NEEDED) return null
      switch (transfer.completedStep) {
        case APPROVE: return 'Lock'
        case SYNC: return 'Mint'
      }
    }
  }
}

// Called when status is ACTION_NEEDED or FAILED
export function act (transfer) {
  switch (transfer.completedStep) {
    case null: return approve(transfer)
    case APPROVE: return lock(transfer)
    case LOCK: return checkSync(transfer)
    case SYNC: return mint(transfer)
    default: throw new Error(`Don't know how to act on transfer: ${JSON.stringify(transfer)}`)
  }
}

// Called when status is IN_PROGRESS
export function checkStatus (transfer) {
  switch (transfer.completedStep) {
    case null: return checkApprove(transfer)
    case APPROVE: return checkLock(transfer)
    case LOCK: return checkSync(transfer)
    case SYNC: return checkMint(transfer)
  }
}

// Call contract given by `erc20` contract, requesting
// permission for window.ethTokenLocker to transfer 'amount' tokens
// on behalf of the default user set up in authEthereum.js.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
export async function initiate ({
  erc20Address,
  amount,
  sender,
  recipient
}) {
  // TODO: move to core 'decorate'; get both from contracts
  const sourceTokenName = await getErc20Name(erc20Address)
  const destinationTokenName = sourceTokenName + 'ⁿ'

  // various attributes stored as arrays, to keep history of retries
  let transfer = {
    // attributes common to all transfer types
    amount,
    completedStep: null,
    destinationTokenName,
    errors: [],
    recipient,
    sender,
    sourceToken: erc20Address,
    sourceTokenName,
    status: status.ACTION_NEEDED,
    type: '@eth+near/erc20+nep21/natural-erc20-to-nep21',

    // attributes specific to natural-erc20-to-nep21 transfers
    approvalHashes: [],
    approvalReceipts: [],
    completedConfirmations: 0,
    lockHashes: [],
    lockReceipts: [],
    neededConfirmations: 30 // hard-coding until connector contract is updated with this information
  }

  transfer = await approve(transfer)

  track(transfer)
}

async function approve (transfer) {
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    transfer.sourceToken,
    { from: transfer.sender }
  )

  const approvalHash = await new Promise((resolve, reject) => {
    erc20Contract.methods
      .approve(process.env.ethLockerAddress, transfer.amount).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })

  return {
    ...transfer,
    approvalHashes: [...transfer.approvalHashes, approvalHash],
    status: status.IN_PROGRESS
  }
}

async function checkApprove (transfer) {
  const approvalHash = last(transfer.approvalHashes)
  const approvalReceipt = await window.web3.eth.getTransactionReceipt(
    approvalHash
  )

  if (!approvalReceipt) return transfer

  if (!approvalReceipt.status) {
    let error
    try {
      const ethNetwork = await window.web3.eth.net.getNetworkType()
      error = await getRevertReason(approvalHash, ethNetwork)
    } catch (e) {
      console.error(e)
      error = `Could not determine why transaction failed; encountered error: ${e.message}`
    }
    return {
      ...transfer,
      approvalReceipts: [...transfer.approvalReceipts, approvalReceipt],
      errors: [...transfer.errors, error],
      status: status.FAILED
    }
  }

  return {
    ...transfer,
    approvalReceipts: [...transfer.approvalReceipts, approvalReceipt],
    completedStep: APPROVE,
    status: status.ACTION_NEEDED
  }
}

// Call window.ethTokenLocker, locking 'amount' tokens.
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
async function lock (transfer) {
  const lockHash = await new Promise((resolve, reject) => {
    window.ethTokenLocker.methods
      .lockToken(transfer.sourceToken, transfer.amount, transfer.recipient).send()
      .on('transactionHash', resolve)
      .catch(reject)
  })

  return {
    ...transfer,
    status: status.IN_PROGRESS,
    lockHashes: [...transfer.lockHashes, lockHash]
  }
}

async function checkLock (transfer) {
  const lockHash = last(transfer.lockHashes)
  const lockReceipt = await window.web3.eth.getTransactionReceipt(
    lockHash
  )

  if (!lockReceipt) return transfer

  if (!lockReceipt.status) {
    let error
    try {
      const ethNetwork = await window.web3.eth.net.getNetworkType()
      error = await getRevertReason(lockHash, ethNetwork)
    } catch (e) {
      console.error(e)
      error = `Could not determine why transaction failed; encountered error: ${e.message}`
    }
    return {
      ...transfer,
      status: status.FAILED,
      errors: [...transfer.errors, error],
      lockReceipts: [...transfer.lockReceipts, lockReceipt]
    }
  }

  return {
    ...transfer,
    status: status.IN_PROGRESS,
    completedStep: LOCK,
    lockReceipts: [...transfer.lockReceipts, lockReceipt]
  }
}

async function checkSync (transfer) {
  const lockReceipt = last(transfer.lockReceipts)
  const eventEmittedAt = lockReceipt.blockNumber
  const syncedTo = await lastBlockNumber()
  const completedConfirmations = Math.max(0, syncedTo - eventEmittedAt)

  if (completedConfirmations < transfer.neededConfirmations) {
    return {
      ...transfer,
      completedConfirmations,
      status: status.IN_PROGRESS
    }
  }

  return {
    ...transfer,
    completedConfirmations,
    completedStep: SYNC,
    status: status.ACTION_NEEDED
  }
}

// Mint NEP21 tokens to transfer.recipient. Causes a redirect to NEAR Wallet,
// currently dealt with using URL params.
async function mint (transfer) {
  console.log(transfer)
  const lockReceipt = last(transfer.lockReceipts)
  const proof = await findProof(lockReceipt.transactionHash)

  // Calling `nearFungibleTokenFactory.deposit` causes a redirect to NEAR Wallet.
  //
  // This adds some info about the current transaction to the URL params, then
  // returns to mark the transfer as in-progress, and THEN executes the
  // `deposit` function.
  //
  // Since this happens very quickly in human time, a user will not have time
  // to start two `deposit` calls at the same time, and the `checkMint` will be
  // able to correctly identify the transfer and see if the transaction
  // succeeded.
  setTimeout(async () => {
    const balanceBefore = await getNep21Balance(transfer)
    urlParams.set({ minting: transfer.id, balanceBefore })
    window.nearFungibleTokenFactory.deposit(
      proof,
      new BN('300000000000000'),
      // We need to attach tokens because minting increases the contract state, by <600 bytes, which
      // requires an additional 0.06 NEAR to be deposited to the account for state staking.
      // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
      new BN('100000000000000000000').mul(new BN('600'))
    )
  }, 100)

  return {
    ...transfer,
    status: status.IN_PROGRESS
  }
}

export async function checkMint (transfer) {
  const id = urlParams.get('minting')
  if (!id || id !== transfer.id) {
    return {
      ...transfer,
      status: status.FAILED,
      errors: [...transfer.errors, "Couldn't determine transaction outcome"]
    }
  }

  const balanceBefore = Number(urlParams.get('balanceBefore'))
  const balanceAfter = await getNep21Balance(transfer)

  urlParams.clear('minting', 'balanceBefore')

  if (balanceBefore + transfer.amount !== balanceAfter) {
    return {
      ...transfer,
      status: status.FAILED,
      errors: [
        ...transfer.errors,
        `Something went wrong. Pre-transaction balance (${balanceBefore})
        + transfer amount (${transfer.amount}) =
        ${balanceBefore + transfer.amount}, but new balance is instead
        ${balanceAfter}.`
      ]
    }
  }

  return {
    ...transfer,
    completedStep: MINT,
    status: status.COMPLETE
  }
}

async function getNep21Balance (transfer) {
  const nep21Address =
    transfer.sourceToken.replace('0x', '').toLowerCase() +
    '.' +
    process.env.nearTokenFactoryAccount

  const nep21 = await new NearContract(
    window.nearConnection.account(),
    nep21Address,
    { viewMethods: ['get_balance'] }
  )

  return nep21.get_balance({ owner_id: transfer.recipient })
    .then(raw => Number(raw))
    .catch(() => null)
}
