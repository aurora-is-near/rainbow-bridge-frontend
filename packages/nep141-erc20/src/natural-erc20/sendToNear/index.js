import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import getRevertReason from 'eth-revert-reason'
import Web3 from 'web3'
import { track } from '@near-eth/client'
import { stepsFor } from '@near-eth/client/dist/i18nHelpers'
import * as status from '@near-eth/client/dist/statuses'
import { getEthProvider, getNearAccount, formatLargeNum } from '@near-eth/client/dist/utils'
import getNep141Balance from '../../bridged-nep141/getBalance'
import getName from '../getName'
import { getDecimals } from '../getMetadata'
import findProof from './findProof'
import { lastBlockNumber } from './ethOnNearClient'
import * as urlParams from './urlParams'

export const SOURCE_NETWORK = 'ethereum'
export const DESTINATION_NETWORK = 'near'
export const TRANSFER_TYPE = '@near-eth/nep141-erc20/natural-erc20/sendToNear'

const APPROVE = 'approve-natural-erc20-to-nep141'
const LOCK = 'lock-natural-erc20-to-nep141'
const SYNC = 'sync-natural-erc20-to-nep141'
const MINT = 'mint-natural-erc20-to-nep141'

const steps = [
  APPROVE,
  LOCK,
  SYNC,
  MINT
]

export const i18n = {
  en_US: {
    steps: transfer => stepsFor(transfer, steps, {
      [APPROVE]: `Approve Token Locker to spend ${formatLargeNum(transfer.amount, transfer.decimals)} ${transfer.sourceTokenName}`,
      [LOCK]: `Lock ${formatLargeNum(transfer.amount, transfer.decimals)} ${transfer.sourceTokenName} in Token Locker`,
      [SYNC]: `Sync ${transfer.neededConfirmations} blocks from Ethereum to NEAR`,
      [MINT]: `Mint ${formatLargeNum(transfer.amount, transfer.decimals)} ${transfer.destinationTokenName} in NEAR`
    }),
    statusMessage: transfer => {
      if (transfer.status === status.FAILED) return 'Failed'
      if (transfer.status === status.ACTION_NEEDED) {
        switch (transfer.completedStep) {
          case APPROVE: return 'Ready to lock in Ethereum'
          case SYNC: return 'Ready to mint in NEAR'
          default: throw new Error(`Transfer in unexpected state, transfer with ID=${transfer.id} & status=${transfer.status} has completedStep=${transfer.completedStep}`)
        }
      }
      switch (transfer.completedStep) {
        case null: return 'Approving Token Locker'
        case APPROVE: return 'Locking in Ethereum'
        case LOCK: return `Syncing block ${transfer.completedConfirmations + 1}/${transfer.neededConfirmations}`
        case SYNC: return 'Minting in NEAR'
        case MINT: return 'Transfer complete'
        default: throw new Error(`Transfer in unexpected state, transfer with ID=${transfer.id} & status=${transfer.status} has completedStep=${transfer.completedStep}`)
      }
    },
    callToAction: transfer => {
      if (transfer.status === status.FAILED) return 'Retry'
      if (transfer.status !== status.ACTION_NEEDED) return null
      switch (transfer.completedStep) {
        case APPROVE: return 'Lock'
        case SYNC: return 'Mint'
        default: return null
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
    default: throw new Error(`Don't know how to act on transfer: ${transfer.id}`)
  }
}

// Called when status is IN_PROGRESS
export function checkStatus (transfer) {
  switch (transfer.completedStep) {
    case null: return checkApprove(transfer)
    case APPROVE: return checkLock(transfer)
    case LOCK: return checkSync(transfer)
    case SYNC: return checkMint(transfer)
    default: throw new Error(`Don't know how to checkStatus for transfer ${transfer.id}`)
  }
}

// Call contract given by `erc20` contract, requesting permission for contract
// at `process.env.ethLockerAddress` to transfer 'amount' tokens
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
  const sourceTokenName = await getName(erc20Address)
  // TODO: call initiate with a formated amount and query decimals when decorate()
  const decimals = await getDecimals(erc20Address)
  const destinationTokenName = sourceTokenName + 'ⁿ'

  // various attributes stored as arrays, to keep history of retries
  let transfer = {
    // attributes common to all transfer types
    amount: (new Decimal(amount).times(10 ** decimals)).toFixed(),
    completedStep: null,
    destinationTokenName,
    errors: [],
    recipient,
    sender,
    sourceToken: erc20Address,
    sourceTokenName,
    decimals,
    status: status.ACTION_NEEDED,
    type: TRANSFER_TYPE,

    // attributes specific to natural-erc20-to-nep141 transfers
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
  const web3 = new Web3(getEthProvider())

  const erc20Contract = new web3.eth.Contract(
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
  const web3 = new Web3(getEthProvider())

  const approvalHash = last(transfer.approvalHashes)
  const approvalReceipt = await web3.eth.getTransactionReceipt(
    approvalHash
  )

  if (!approvalReceipt) return transfer

  if (!approvalReceipt.status) {
    let error
    try {
      const ethNetwork = await web3.eth.net.getNetworkType()
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

// Initiate "lock" transaction.
//
// Only wait for transaction to have dependable transactionHash created. Avoid
// blocking to wait for transaction to be mined. Status of transactionHash
// being mined is then checked in checkStatus.
async function lock (transfer) {
  const web3 = new Web3(getEthProvider())
  const ethUserAddress = (await web3.eth.getAccounts())[0]

  const ethTokenLocker = new web3.eth.Contract(
    JSON.parse(process.env.ethLockerAbiText),
    process.env.ethLockerAddress,
    { from: ethUserAddress }
  )

  const lockHash = await new Promise((resolve, reject) => {
    ethTokenLocker.methods
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
  const web3 = new Web3(getEthProvider())
  const lockReceipt = await web3.eth.getTransactionReceipt(
    lockHash
  )

  if (!lockReceipt) return transfer

  if (!lockReceipt.status) {
    let error
    try {
      const ethNetwork = await web3.eth.net.getNetworkType()
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

// Mint NEP141 tokens to transfer.recipient. Causes a redirect to NEAR Wallet,
// currently dealt with using URL params.
async function mint (transfer) {
  const nearAccount = await getNearAccount({
    authAgainst: process.env.nearTokenFactoryAccount
  })
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
    const balanceBefore = await getNep141Balance({
      erc20Address: transfer.sourceToken,
      user: transfer.recipient
    })
    urlParams.set({ minting: transfer.id, balanceBefore })
    await nearAccount.functionCall(
      process.env.nearTokenFactoryAccount,
      'deposit',
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

  const balanceBefore = new BN(urlParams.get('balanceBefore'))
  const balanceAfter = new BN(await getNep141Balance({
    erc20Address: transfer.sourceToken,
    user: transfer.recipient
  }))
  const transferAmount = new BN(transfer.amount)

  urlParams.clear('minting', 'balanceBefore')

  if (!balanceBefore.add(transferAmount).eq(balanceAfter)) {
    return {
      ...transfer,
      status: status.FAILED,
      errors: [
        ...transfer.errors,
        `Something went wrong. Pre-transaction balance (${balanceBefore})
        + transfer amount (${transfer.amount}) =
        ${balanceBefore.add(transferAmount)}, but new balance is instead
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

const last = arr => arr[arr.length - 1]
