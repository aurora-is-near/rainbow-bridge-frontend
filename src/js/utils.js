import BN from 'bn.js'
import { ethers } from 'ethers'

// import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'
// import { bridgedNEAR, naturalNEAR } from '@near-eth/near-ether'

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

export async function getMinStorageBalance (nep141Address) {
  const nearAccount = await window.nearConnection.account()
  try {
    const balance = await nearAccount.viewFunction(
      nep141Address,
      'storage_balance_bounds'
    )
    return balance.min
  } catch (e) {
    const balance = await nearAccount.viewFunction(
      nep141Address,
      'storage_minimum_balance'
    )
    return balance
  }
}

export async function getStorageBalance (nep141Address, accountId) {
  const nearAccount = await window.nearConnection.account()
  try {
    const balance = await nearAccount.viewFunction(
      nep141Address,
      'storage_balance_of',
      { account_id: accountId }
    )
    return balance
  } catch (e) {
    console.warn(e, nep141Address)
    return null
  }
}

export async function getErc20Data (nep141Address) {
  const metadata = await getMetadata(nep141Address) || {}
  const erc20Address = await getAuroraErc20Address(nep141Address) || ''
  const nep141 = {
    address: nep141Address,
    balance: await getNep141Balance(nep141Address, window.nearUserAddress),
    name: metadata.symbol || nep141Address.slice(0, 5) + '...'
  }
  const erc20 = {
    address: erc20Address,
    name: metadata.symbol || '0x' + erc20Address.slice(0, 5) + '...',
    balance: await getErc20Balance(erc20Address, window.ethUserAddress),
    decimals: metadata.decimals
  }
  const auroraStorageBalance = await getStorageBalance(nep141Address, 'aurora')
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
  return { near: await getNearData(), eth: await getEthData(), ...tokens }
}

export async function getNearData () {
  const aNearAddress = await getAuroraErc20Address(process.env.wNearNep141)
  const aNearBalance = await getErc20Balance(aNearAddress, window.ethUserAddress)
  const nearAccount = await window.nearConnection.account()
  const { available: nearBalance } = await nearAccount.getAccountBalance()
  return {
    address: aNearAddress,
    balance: aNearBalance,
    decimals: 24,
    name: 'NEAR',
    icon: 'near.svg',
    auroraStorageBalance: await getStorageBalance(process.env.wNearNep141, 'aurora'),
    nep141: {
      address: 'near',
      balance: nearBalance,
      name: 'NEAR'
    }
  }
}

export async function getEthData () {
  const ethOnAuroraBalance = (await window.web3Provider.getBalance(window.ethUserAddress)).toString()
  const ethOnNearBalance = await getNep141Balance('aurora', window.nearUserAddress)
  console.log(ethOnAuroraBalance, ethOnNearBalance)
  return {
    address: 'eth',
    balance: ethOnAuroraBalance,
    decimals: 18,
    name: 'ETH',
    // icon: 'ethereum.svg',
    auroraStorageBalance: true,
    nep141: {
      address: 'aurora',
      balance: ethOnNearBalance,
      name: 'nETH'
    }
  }
}

export function rememberCustomErc20 (nep141Address) {
  if (!nep141Address || nep141Address === 'near' || nep141Address === 'aurora') return
  if (process.env.featuredNep141s.includes(nep141Address)) return

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
    console.error(error, nep141Address)
    return null
  }
  return auroraErc20Addresses[nep141Address]
}

export async function registerStorage (nep141Address, accountId) {
  const nearAccount = await window.nearConnection.account()
  const minStorageBalance = await getMinStorageBalance(nep141Address)
  window.urlParams.set({ bridging: nep141Address })
  await nearAccount.functionCall(
    nep141Address,
    'storage_deposit',
    {
      account_id: accountId,
      registration_only: true
    },
    new BN('100' + '0'.repeat(12)),
    new BN(minStorageBalance)
  )
}

export const chainIdToEthNetwork = {
  1313161555: 'Aurora Testnet',
  1313161554: 'Aurora Mainnet',
  1: 'main',
  3: 'ropsten',
  4: 'rinkeby'
}
