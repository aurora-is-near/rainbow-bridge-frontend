import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'
import { bridgedNEAR, naturalNEAR } from '@near-eth/near-ether'

import { ethers } from 'ethers'

import { Decimal } from 'decimal.js'

export const CUSTOM_ERC20_STORAGE = 'custom-erc20s'

export function formatLargeNum (n, decimals = 18) {
  // decimals defaults to 18 for old transfers in state that didn't record transfer.decimals
  if (!n) {
    return new Decimal(0)
  }
  return new Decimal(n).dividedBy(10 ** decimals)
}

export async function getErc20Data (address) {
  const [erc20Metadata, allowance, erc20Balance, nep141Metadata, nep141Balance] = await Promise.all([
    naturalErc20.getMetadata({ erc20Address: address }),
    naturalErc20.getAllowance({
      erc20Address: address,
      owner: window.ethUserAddress,
      spender: process.env.ethLockerAddress
    }),
    naturalErc20.getBalance({
      erc20Address: address,
      owner: window.ethUserAddress
    }),
    bridgedNep141.getMetadata({ erc20Address: address }),
    bridgedNep141.getBalance({ erc20Address: address, owner: window.nearUserAddress })
  ])
  const erc20 = { ...erc20Metadata, name: erc20Metadata.symbol, address, balance: erc20Balance }
  const nep141 = { ...nep141Metadata, balance: nep141Balance }
  if (address.toLowerCase() === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2') {
    erc20.name = 'MKR'
    nep141.name = 'nMKR'
  }
  // TODO remove once available on trustwallet.
  if (address.toLowerCase() === '0xf5cfbc74057c610c8ef151a439252680ac68c6dc') {
    erc20.icon = 'oct-token.svg'
  }
  if (address.toLowerCase() === '0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54') {
    erc20.icon = 'hapi-token.svg'
  }
  return { ...erc20, allowance, nep141 }
}

export async function getAllTokens () {
  const featuredErc20s = JSON.parse(process.env.featuredErc20s)
  let customErc20s = JSON.parse(localStorage.getItem(CUSTOM_ERC20_STORAGE))
  if (customErc20s === null) { customErc20s = [] }

  const tokens = (await Promise.all(
    [...customErc20s, ...featuredErc20s].map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
  return { near: await getNearData(), eth: await getEthData(), ...tokens }
}

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

export async function getEthData () {
  const provider = new ethers.providers.Web3Provider(window.provider)
  const ethBalance = (await provider.getBalance(window.ethUserAddress)).toString()
  const ethOnNearBalance = await getNep141Balance(process.env.auroraEvmAccount, window.nearUserAddress)
  console.log(ethBalance, ethOnNearBalance)
  return {
    address: 'eth',
    balance: ethBalance,
    allowance: '-1',
    decimals: 18,
    name: 'ETH',
    icon: 'ethereum.svg',
    nep141: {
      address: process.env.auroraEvmAccount,
      balance: ethOnNearBalance,
      name: 'nETH'
    }
  }
}

export async function getNearData () {
  const nearBalance = await naturalNEAR.getBalance()
  const eNearBalance = await bridgedNEAR.getBalance(window.ethUserAddress)
  return {
    address: process.env.eNEARAddress,
    balance: eNearBalance,
    allowance: '-1',
    decimals: 24,
    name: 'NEAR',
    icon: 'near.svg',
    nep141: {
      address: 'near',
      balance: nearBalance,
      name: 'NEAR'
    }
  }
}

export function rememberCustomErc20 (erc20Address) {
  if (!erc20Address) return
  erc20Address = erc20Address.toLowerCase()
  if (process.env.featuredErc20s.includes(erc20Address)) return
  if (erc20Address === process.env.eNEARAddress.toLowerCase()) return
  if (erc20Address === 'eth') return

  const customErc20s = JSON.parse(localStorage.getItem(CUSTOM_ERC20_STORAGE))
  if (customErc20s === null) {
    localStorage.setItem(CUSTOM_ERC20_STORAGE, JSON.stringify([erc20Address]))
  } else if (!customErc20s.includes(erc20Address)) {
    localStorage.setItem(CUSTOM_ERC20_STORAGE, JSON.stringify([...customErc20s, erc20Address]))
  }
}

export const chainIdToEthNetwork = {
  1: 'main',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli'
}
