import { bridgedNep141, naturalErc20 } from '@near-eth/nep141-erc20'

import { Decimal } from 'decimal.js'

export function formatLargeNum (n, decimals = 18) {
  // decimals defaults to 18 for old transfers in state that didn't record transfer.decimals
  return new Decimal(n).dividedBy(10 ** decimals)
}

export async function getErc20Data (address) {
  const [erc20, nep141] = await Promise.all([
    naturalErc20.getMetadata(address, window.ethUserAddress),
    bridgedNep141.getMetadata(address, window.nearUserAddress)
  ])
  return { ...erc20, nep141 }
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
