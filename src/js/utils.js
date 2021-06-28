import { ethers } from 'ethers'

// import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'
// import { bridgedNEAR, naturalNEAR } from '@near-eth/near-ether'
import { serialize as serializeBorsh } from 'near-api-js/lib/utils/serialize'

import { Decimal } from 'decimal.js'

const CUSTOM_NEP141_STORAGE = 'custom-nep141s'

export function formatLargeNum (n, decimals = 18) {
  // decimals defaults to 18 for old transfers in state that didn't record transfer.decimals
  if (!n) {
    return new Decimal(0)
  }
  return new Decimal(n).dividedBy(10 ** decimals)
}

/*
export async function getErc20Data (address) {
  const [erc20, allowance, nep141] = await Promise.all([
    naturalErc20.getMetadata(address, window.ethUserAddress),
    naturalErc20.getAllowance({
      erc20Address: address,
      owner: window.ethUserAddress,
      spender: process.env.ethLockerAddress
    }),
    bridgedNep141.getMetadata(address, window.nearUserAddress)
  ])
  if (address.toLowerCase() === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2') {
    erc20.name = 'MKR'
    nep141.name = 'nMKR'
  }
  return { ...erc20, allowance, nep141 }
}
*/

// Query this data once
const tokenMetadata = {}
const auroraErc20Addresses = {}

async function getNep141Balance (address, user) {
  const nearAccount = await window.nearConnection.account()
  try {
    const balanceAsString = await nearAccount.viewFunction(
      address,
      'ft_balance_of',
      { account_id: user }
    )
    return balanceAsString
  } catch (e) {
    console.warn(e)
    return null
  }
}
async function getErc20Balance (address, user) {
  try {
    const erc20Contract = new ethers.Contract(
      address,
      process.env.ethErc20AbiText,
      window.web3Provider
    )
    return (await erc20Contract.balanceOf(user)).toString()
  } catch (e) {
    console.warn(e)
    return null
  }
}

async function getMetadata (nep141Address) {
  if (tokenMetadata[nep141Address]) return tokenMetadata[nep141Address]

  const nearAccount = await window.nearConnection.account()
  const metadata = await nearAccount.viewFunction(
    nep141Address,
    'ft_metadata'
  )
  tokenMetadata[nep141Address] = metadata
  return metadata
}

async function getAuroraStorageBalance (address) {
  const nearAccount = await window.nearConnection.account()
  try {
    const balance = await nearAccount.viewFunction(
      address,
      'storage_balance_of',
      { account_id: 'aurora' }
    )
    return balance
  } catch (e) {
    console.warn(e, address)
    return null
  }
}

export async function getErc20Data (nep141Address) {
  const metadata = await getMetadata(nep141Address) || {}
  const erc20Address = await getAuroraErc20Address(nep141Address) || ''
  const nep141 = {
    address: nep141Address,
    balance: await getNep141Balance(nep141Address, window.nearUserAddress),
    name: metadata.name || nep141Address.slice(0, 5) + '...'
  }
  const erc20 = {
    address: erc20Address,
    name: metadata.name || '0x' + erc20Address.slice(0, 5) + '...',
    balance: await getErc20Balance(erc20Address, window.ethUserAddress),
    decimals: metadata.decimals || 18 // TODO default as 0 for tokens needing metadata update.
  }
  // If auroraStorageBalance is null, then the "aurora" account needs to be registered (pay for storage) in the NEP-141
  const auroraStorageBalance = await getAuroraStorageBalance(nep141Address)
  return { ...erc20, nep141, auroraStorageBalance }
}

export async function getAllTokens () {
  const featuredNep141s = JSON.parse(process.env.featuredNep141s)
  let customNep141s = JSON.parse(localStorage.getItem(CUSTOM_NEP141_STORAGE))
  if (customNep141s === null) { customNep141s = [] }

  const tokens = (await Promise.all(
    [...customNep141s, ...featuredNep141s].map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
  // return { near: await getNearData(), ...tokens }
  return tokens
}

/*
TODO NEAR connector not available on NEAR <> Aurora
export async function getNearData () {
  // const nearBalance = await naturalNEAR.getBalance(window.ethUserAddress)
  // const eNearBalance = await bridgedNEAR.getBalance(window.ethUserAddress)
  const nearAccount = await window.nearConnection.account()
  const { available: nearBalance } = await nearAccount.getAccountBalance()
  return {
    address: '',
    balance: 1110000000000000000000000000, // TODO
    allowance: '-1',
    decimals: 24,
    name: 'NEAR',
    icon: 'near.svg',
    nep141: {
      address: 'near',
      balance: nearBalance, // TODO
      name: 'NEAR'
    }
  }
}
*/

export function rememberCustomErc20 (nep141Address) {
  if (process.env.featuredNep141s.includes(nep141Address)) return
  if (nep141Address === 'near') return

  const customNep141s = JSON.parse(localStorage.getItem(CUSTOM_NEP141_STORAGE))
  if (customNep141s === null) {
    localStorage.setItem(CUSTOM_NEP141_STORAGE, JSON.stringify([nep141Address]))
  } else if (!customNep141s.includes(nep141Address)) {
    localStorage.setItem(CUSTOM_NEP141_STORAGE, JSON.stringify([...customNep141s, nep141Address]))
  }
}

export async function getAuroraErc20Address (nep141Address) {
  if (auroraErc20Addresses[nep141Address]) return auroraErc20Addresses[nep141Address]
  try {
    const address = await window.near.connection.provider.query({
      request_type: 'call_function',
      finality: 'final',
      account_id: 'aurora',
      method_name: 'get_erc20_from_nep141',
      args_base64: Buffer.from(nep141Address).toString('base64')
    })
    auroraErc20Addresses[nep141Address] = Buffer.from(address.result).toString('hex')
  } catch (error) {
    console.warn(error)
    return null
  }
  return auroraErc20Addresses[nep141Address]
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
  await nearAccount.functionCall(
    'aurora',
    'deploy_erc20_token',
    arg,
    new window.BN('100' + '0'.repeat(12)),
    new window.BN('3' + '0'.repeat(24))
  )
}

export async function withdrawToNear (erc20Address, amount) {
  const contractAbiFragment = [
    'function withdrawToNear(bytes memory recipient, uint256 amount) external'
  ]
  const erc20Contract = new ethers.Contract(
    erc20Address,
    contractAbiFragment,
    window.web3Provider.getSigner()
  )
  const tx = await erc20Contract.withdrawToNear(
    Buffer.from(window.nearUserAddress),
    amount,
    { gasLimit: 100000 }
  )
  return tx
}

export async function registerAurora (nep141Address) {
  const nearAccount = await window.nearConnection.account()
  await nearAccount.functionCall(
    nep141Address,
    'storage_deposit',
    {
      account_id: 'aurora',
      registration_only: true
    },
    new window.BN('100' + '0'.repeat(12)),
    new window.BN('6' + '0'.repeat(22))
  )
}

export async function sendToAurora (nep141Address, amount) {
  const nearAccount = await window.nearConnection.account()
  await nearAccount.functionCall(
    nep141Address,
    'ft_transfer_call',
    {
      receiver_id: 'aurora',
      amount: amount,
      memo: null,
      msg: window.ethUserAddress.slice(2)
    },
    new window.BN('100' + '0'.repeat(12)),
    new window.BN('1')
  )
}

export const chainIdToEthNetwork = {
  1313161555: 'Aurora Testnet',
  1313161554: 'Aurora Mainnet',
  1: 'main',
  3: 'ropsten',
  4: 'rinkeby'
}
