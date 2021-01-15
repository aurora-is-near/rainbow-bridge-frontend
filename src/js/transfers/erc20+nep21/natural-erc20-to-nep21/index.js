import BN from 'bn.js'
import getRevertReason from 'eth-revert-reason'
import { Contract as NearContract } from 'near-api-js'
import { getErc20Name } from '../../../ethHelpers'
import * as urlParams from '../../../urlParams'
import { stepsFor } from '../../i18nHelpers'
import * as status from '../../statuses'
import { track } from '../..'
import findProof from './findProof'

export const SOURCE_NETWORK = 'ethereum'
export const DESTINATION_NETWORK = 'near'

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
          case APPROVE: return 'Ready to lock'
          case SYNC: return 'Ready to mint'
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

export function act (transfer) {
  switch (transfer.completedStep) {
    case null: return approve(transfer)
    case APPROVE: return lock(transfer)
    case SYNC: return mint(transfer)
    default: throw new Error(`Don't know how to act on transfer: ${JSON.stringify(transfer)}`)
  }
}

export function checkStatus (transfer) {
  switch (transfer.completedStep) {
    case null: return checkApprove(transfer)
    case APPROVE: return checkLock(transfer)
    case LOCK: return checkSync(transfer)
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
  recipient,
  advanceEvery
}) {
  // TODO: move to core 'decorate'; get both from contracts
  const sourceTokenName = await getErc20Name(erc20Address)
  const destinationTokenName = 'n' + sourceTokenName

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
    status: status.IN_PROGRESS,
    type: '@eth+near/erc20+nep21/natural-erc20-to-nep21',

    // attributes specific to natural-erc20-to-nep21 transfers
    approvalHashes: [],
    approvalReceipts: [],
    completedConfirmations: 0,
    lockHashes: [],
    lockReceipts: [],
    neededConfirmations: 10 // hard-coding until connector contract is updated with this information
  }

  transfer = await approve(transfer)

  track(transfer, { advanceEvery })
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
  const approvalHash = transfer.approvalHashes[transfer.approvalHashes.length - 1]
  const approvalReceipt = await window.web3.eth.getTransactionReceipt(
    approvalHash
  )

  if (!approvalReceipt) return transfer

  if (!approvalReceipt.status) {
    let error
    try {
      error = await getRevertReason(approvalHash, process.env.ethNetwork)
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
  const lockHash = transfer.lockHashes[transfer.lockHashes.length - 1]
  const lockReceipt = await window.web3.eth.getTransactionReceipt(
    lockHash
  )

  if (!lockReceipt) return transfer

  if (!lockReceipt.status) {
    let error
    try {
      error = await getRevertReason(lockHash, process.env.ethNetwork)
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
  const lockReceipt = transfer.lockReceipts[transfer.lockReceipts.length - 1]
  const eventEmittedAt = lockReceipt.blockNumber
  const syncedTo = await window.ethOnNearClient.lastBlockNumber()
  const completedConfirmations = Math.max(0, syncedTo - eventEmittedAt)

  if (completedConfirmations < transfer.neededConfirmations) {
    return {
      ...transfer,
      completedConfirmations
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
  const balanceBefore = Number(
    await getNep21Balance(transfer.sourceToken)
  )
  urlParams.set({ minting: transfer.id, balanceBefore })

  await window.nearFungibleTokenFactory.deposit(
    await findProof(transfer),
    new BN('300000000000000'),
    // We need to attach tokens because minting increases the contract state, by <600 bytes, which
    // requires an additional 0.06 NEAR to be deposited to the account for state staking.
    // Note technically 0.0537 NEAR should be enough, but we round it up to stay on the safe side.
    new BN('100000000000000000000').mul(new BN('600'))
  )
}

// Called by by core checkStatusAll logic prior to calling checkStatus for each
// individual transfer; used to check outcome of `mint` call that caused
// redirect to NEAR Wallet
export async function checkCompletion (transfer) {
  const balanceBefore = Number(urlParams.get('balanceBefore'))
  const balanceAfter = Number(await getNep21Balance(transfer.sourceToken))

  if (balanceBefore + transfer.amount !== balanceAfter) {
    return {
      ...transfer,
      status: status.FAILED,
      errors: [
        ...transfer.errors,
        `Something went wrong. Pre-transaction balance + transfer amount =
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
