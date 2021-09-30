import BN from 'bn.js'
import { naturalNep141, bridgedErc20 } from '@near-eth/aurora-nep141'

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

async function getNep141Balance (nep141Address, owner) {
  try {
    const balanceAsString = await naturalNep141.getBalance({ nep141Address, owner })
    return balanceAsString
  } catch (e) {
    console.warn(e)
    return null
  }
}
async function getErc20Balance (erc20Address, owner) {
  try {
    const balance = await bridgedErc20.getBalance(
      { erc20Address, owner, options: { provider: window.web3Provider } }
    )
    return balance
  } catch (e) {
    console.warn(e, erc20Address)
    return null
  }
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
    console.warn(e, nep141Address)
  }
  try {
    const balance = await nearAccount.viewFunction(
      nep141Address,
      'storage_minimum_balance'
    )
    return balance
  } catch (e) {
    console.warn(e, nep141Address)
  }
  // Default to the usual storage balance requirement
  console.error('Failed to fetch storage balance requirement, defaulting to 0.0125 $NEAR: ', nep141Address)
  return '12500000000000000000000'
}

export async function getStorageBalance (nep141Address, accountId) {
  const nearAccount = await window.nearConnection.account()
  try {
    const balance = await nearAccount.viewFunction(
      nep141Address,
      'storage_balance_of',
      { account_id: accountId }
    )
    return balance || { total: '0', available: '0' }
  } catch (e) {
    console.warn(e, nep141Address)
    return null
  }
}

export async function getErc20Data (nep141Address) {
  const erc20Address = await bridgedErc20.getAuroraErc20Address({ nep141Address }) || ''
  const [nep141Metadata, nep141Balance, erc20Balance, storageBalance, minStorageBalance, auroraStorageBalance] = await Promise.all([
    naturalNep141.getMetadata({ nep141Address }),
    getNep141Balance(nep141Address, window.nearUserAddress),
    getErc20Balance(erc20Address, window.ethUserAddress),
    getStorageBalance(nep141Address, window.nearUserAddress),
    getMinStorageBalance(nep141Address),
    getStorageBalance(nep141Address, process.env.auroraEvmAccount)
  ])
  const metadata = nep141Metadata || {}
  const nep141 = {
    address: nep141Address,
    balance: nep141Balance,
    name: metadata.symbol || nep141Address.slice(0, 5) + '...',
    storageBalance,
    minStorageBalance
  }
  const erc20 = {
    address: erc20Address,
    name: metadata.symbol || erc20Address.slice(0, 5) + '...',
    balance: erc20Balance,
    decimals: metadata.decimals
  }
  return { ...erc20, nep141, auroraStorageBalance: auroraStorageBalance.total }
}

export async function getAllTokens () {
  const featuredNep141s = JSON.parse(process.env.featuredNep141s)
  let customNep141s = JSON.parse(localStorage.getItem(CUSTOM_NEP141_STORAGE))
  if (customNep141s === null) { customNep141s = [] }

  const [tokens, near, eth] = await Promise.all([
    (await Promise.all(
      [...customNep141s, ...featuredNep141s].map(getErc20Data)
    )).reduce(
      (acc, token) => {
        acc[token.address] = token
        return acc
      },
      {}
    ),
    await getNearData(),
    await getEthData()
  ])
  return { near, eth, ...tokens }
}

export async function getNearData () {
  const aNearAddress = await bridgedErc20.getAuroraErc20Address({ nep141Address: process.env.wNearNep141 })
  const nearAccount = await window.nearConnection.account()
  const [aNearBalance, nearBalance, auroraStorageBalance] = await Promise.all([
    getErc20Balance(aNearAddress, window.ethUserAddress),
    nearAccount.getAccountBalance(),
    getStorageBalance(process.env.wNearNep141, process.env.auroraEvmAccount)
  ])
  return {
    address: aNearAddress,
    balance: aNearBalance,
    decimals: 24,
    name: 'NEAR',
    icon: 'near.svg',
    auroraStorageBalance,
    nep141: {
      address: 'near',
      balance: nearBalance.available,
      name: 'NEAR'
    }
  }
}

export async function getEthData () {
  const [ethOnAuroraBalance, ethOnNearBalance, storageBalance, minStorageBalance] = await Promise.all([
    window.web3Provider.getBalance(window.ethUserAddress),
    getNep141Balance(process.env.auroraEvmAccount, window.nearUserAddress),
    getStorageBalance(process.env.auroraEvmAccount, window.nearUserAddress),
    getMinStorageBalance(process.env.auroraEvmAccount)
  ])
  return {
    address: 'eth',
    balance: ethOnAuroraBalance.toString(),
    decimals: 18,
    name: 'ETH',
    // icon: 'ethereum.svg',
    auroraStorageBalance: '1',
    nep141: {
      address: process.env.auroraEvmAccount,
      balance: ethOnNearBalance,
      name: 'nETH',
      storageBalance,
      minStorageBalance
    }
  }
}

export function rememberCustomErc20 (nep141Address) {
  if (!nep141Address || nep141Address === 'near' || nep141Address === process.env.auroraEvmAccount) return
  if (process.env.featuredNep141s.includes(nep141Address)) return

  const customNep141s = JSON.parse(localStorage.getItem(CUSTOM_NEP141_STORAGE))
  if (customNep141s === null) {
    localStorage.setItem(CUSTOM_NEP141_STORAGE, JSON.stringify([nep141Address]))
  } else if (!customNep141s.includes(nep141Address)) {
    localStorage.setItem(CUSTOM_NEP141_STORAGE, JSON.stringify([...customNep141s, nep141Address]))
  }
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
