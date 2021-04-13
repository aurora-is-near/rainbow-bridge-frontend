import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'

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
  return { ...erc20, allowance, nep141 }
}

export async function getAllErc20s () {
  const featuredErc20s = JSON.parse(process.env.featuredErc20s)
  let customErc20s = JSON.parse(localStorage.getItem(CUSTOM_ERC20_STORAGE))
  if (customErc20s === null) { customErc20s = [] }

  return (await Promise.all(
    [...customErc20s, ...featuredErc20s].map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
}

export function rememberCustomErc20 (erc20Address) {
  erc20Address = erc20Address.toLowerCase()
  if (process.env.featuredErc20s.includes(erc20Address)) return

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
