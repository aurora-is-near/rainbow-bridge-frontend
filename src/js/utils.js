import { bridgedNep141, naturalErc20 } from './transfers/nep141~erc20'

export function formatLargeNum (n) {
  if (!n) return 0
  if (n >= 1e5 || (n < 1e-3 && n !== 0)) return n.toExponential()
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 5 }).format(n)
}

export async function getErc20Data (address) {
  const [erc20, nep141] = await Promise.all([
    naturalErc20.getMetadata(address, window.ethUserAddress),
    bridgedNep141.getMetadata(address, window.nearUserAddress)
  ])
  return { ...erc20, nep141 }
}

export async function getFeaturedErc20s () {
  const ethNetwork = await window.web3.eth.net.getNetworkType()

  return (await Promise.all(
    JSON.parse(process.env.featuredErc20s)[ethNetwork].map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
}
