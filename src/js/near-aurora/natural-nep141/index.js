import BN from 'bn.js'
import { track } from '@near-eth/client'
import { serialize as serializeBorsh } from 'near-api-js/lib/utils/serialize'
import { transactions } from 'near-api-js'
import { getMinStorageBalance, getStorageBalance } from '../../utils'

export const SOURCE_NETWORK = 'near'
export const DESTINATION_NETWORK = 'aurora'
export const TRANSFER_TYPE = 'aurora<>near/sendToAurora'

export const i18n = {
  en_US: {
    steps: transfer => [],
    statusMessage: transfer => {
      switch (transfer.status) {
        case 'in-progress': return 'Confirming transaction'
        case 'failed': return transfer.errors[0]
        default: return 'Completed'
      }
    },
    callToAction: transfer => { return 'NONE' }
  }
}

export async function checkStatus (transfer) {
  const id = window.urlParams.get('locking')
  const txHash = window.urlParams.get('transactionHashes')
  const errorCode = window.urlParams.get('errorCode')
  if (!id && !txHash) {
    // The user closed the tab and never rejected or approved the tx from Near wallet.
    // This doesn't protect agains the user broadcasting a tx and closing the tab before
    // redirect. So the dapp has no way of knowing the status of that transaction.
    const newError = 'Transaction hash not available.'
    console.error(newError)
    return {
      ...transfer,
      status: 'failed',
      errors: [newError]
    }
  }
  if (txHash) {
    window.urlParams.clear('transactionHashes', 'locking')
    return { ...transfer, status: 'completed', txHash }
  }
  if (errorCode) {
    const errorCode = window.urlParams.get('errorCode')
    window.urlParams.clear('errorCode', 'errorMessage', 'locking')
    return { ...transfer, status: 'failed', errors: [`Failed: ${errorCode}`] }
  }
  return transfer
}

export async function sendToAurora (nep141Address, amount, decimals, name) {
  let transfer = {
    status: 'in-progress',
    type: TRANSFER_TYPE,
    amount: amount,
    decimals,
    sourceTokenName: name,
    completedStep: null,
    errors: [],
    sender: window.nearUserAddress,
    recipient: window.ethUserAddress
  }
  const nearAccount = await window.nearConnection.account()

  // nETH (aurora) transfers to Aurora has a different protocol:
  // <relayer_id>:<fee(32 bytes)><eth_address_receiver(20 bytes)>
  const msgPrefix = nep141Address === process.env.auroraEvmAccount ? window.nearUserAddress + ':' + '0'.repeat(64) : ''

  window.urlParams.set({ locking: 'processing' })
  transfer = await track(transfer)
  window.urlParams.set({ locking: transfer.id })

  await nearAccount.functionCall(
    nep141Address,
    'ft_transfer_call',
    {
      receiver_id: process.env.auroraEvmAccount,
      amount: amount,
      memo: null,
      msg: msgPrefix + window.ethUserAddress.slice(2)
    },
    new BN('70' + '0'.repeat(12)),
    new BN('1')
  )
}

export async function wrapAndSendNearToAurora (amount) {
  const nearAccount = await window.nearConnection.account()
  const actions = []
  const minStorageBalance = await getMinStorageBalance(process.env.wNearNep141)
  const userStorageBalance = await getStorageBalance(
    process.env.wNearNep141,
    window.nearUserAddress
  )
  if (!userStorageBalance || new BN(userStorageBalance.total).lt(new BN(minStorageBalance))) {
    actions.push(transactions.functionCall(
      'storage_deposit',
      Buffer.from(JSON.stringify({
        account_id: window.nearUserAddress,
        registration_only: true
      })),
      new BN('50' + '0'.repeat(12)),
      new BN(minStorageBalance)
    ))
  }

  actions.push(transactions.functionCall(
    'near_deposit',
    Buffer.from(JSON.stringify({})),
    new BN('30' + '0'.repeat(12)),
    new BN(amount)
  ))
  actions.push(transactions.functionCall(
    'ft_transfer_call',
    Buffer.from(JSON.stringify({
      receiver_id: process.env.auroraEvmAccount,
      amount: amount,
      memo: null,
      msg: window.ethUserAddress.slice(2)
    })),
    new BN('70' + '0'.repeat(12)),
    new BN('1')
  ))
  let transfer = {
    status: 'in-progress',
    type: TRANSFER_TYPE,
    amount: amount,
    decimals: 24,
    sourceTokenName: 'NEAR',
    completedStep: null,
    errors: [],
    sender: window.nearUserAddress,
    recipient: window.ethUserAddress
  }
  window.urlParams.set({ locking: 'processing' })
  transfer = await track(transfer)
  window.urlParams.set({ locking: transfer.id })
  await nearAccount.signAndSendTransaction(process.env.wNearNep141, actions)
}

export async function deployToAurora (nep141Address) {
  class BorshArg {
    constructor (proof) {
      Object.assign(this, proof)
    }
  }

  const borshArgSchema = new Map([
    [BorshArg, {
      kind: 'struct',
      fields: [
        ['nep141', ['u8']]
      ]
    }]
  ])
  const borshArg = new BorshArg({
    nep141: Buffer.from(nep141Address)
  })

  const arg = serializeBorsh(borshArgSchema, borshArg)

  const nearAccount = await window.nearConnection.account()
  window.urlParams.set({ bridging: nep141Address })
  await nearAccount.functionCall(
    process.env.auroraEvmAccount,
    'deploy_erc20_token',
    arg,
    new BN('100' + '0'.repeat(12)),
    new BN('3' + '0'.repeat(24))
  )
}
