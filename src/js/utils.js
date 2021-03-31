import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'

import { Decimal } from 'decimal.js'

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

export async function getFeaturedErc20s () {
  return (await Promise.all(
    JSON.parse(process.env.featuredErc20s).map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
}

export const chainIdToEthNetwork = {
  1: 'main',
  3: 'ropsten',
  4: 'rinkeby'
}
