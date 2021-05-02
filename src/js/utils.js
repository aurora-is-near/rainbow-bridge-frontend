import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'
import { bridgedNEAR, naturalNEAR } from '@near-eth/near-ether'

import { Decimal } from 'decimal.js'

const CUSTOM_ERC20_STORAGE = 'custom-erc20s'

export function formatLargeNum (n, decimals = 18) {
  // decimals defaults to 18 for old transfers in state that didn't record transfer.decimals
  if (!n) {
    return new Decimal(0)
  }
  return new Decimal(n).dividedBy(10 ** decimals)
}

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
  return { ...tokens, near: await getNearData() }
}

export async function getNearData () {
  const nearBalance = await naturalNEAR.getBalance(window.ethUserAddress)
  const eNearBalance = await bridgedNEAR.getBalance(window.ethUserAddress)
  return {
    address: process.env.eNEARAddress,
    balance: eNearBalance,
    allowance: '-1',
    decimals: 24,
    name: 'eNEAR',
    nep141: {
      address: 'near',
      balance: nearBalance,
      name: 'NEAR'
    }
  }
}

export function rememberCustomErc20 (erc20Address) {
  erc20Address = erc20Address.toLowerCase()
  if (process.env.featuredErc20s.includes(erc20Address)) return
  if (process.env.eNEARAddress === erc20Address) return

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
  4: 'rinkeby'
}
