export function formatLargeNum (n) {
  if (!n) return 0
  if (n >= 1e5 || (n < 1e-3 && n !== 0)) return n.toExponential()
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 5 }).format(n)
}

const erc20Balances = {}
export async function getErc20Balance (erc20Address) {
  if (erc20Balances[erc20Address]) return erc20Balances[erc20Address]
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    erc20Address,
    { from: window.ethUserAddress }
  )

  erc20Balances[erc20Address] = Number(
    await erc20Contract.methods.balanceOf(window.ethUserAddress).call()
  )

  return erc20Balances[erc20Address]
}

export function getBridgedNep21Address (erc20Address) {
  return erc20Address.replace('0x', '').toLowerCase() +
      '.' +
      process.env.nearTokenFactoryAccount
}

const nep21Balances = {}
export async function getNep21Balance (erc20Address) {
  if (nep21Balances[erc20Address]) return nep21Balances[erc20Address]

  const nep21 = await new window.NearContract(
    window.nearConnection.account(),
    getBridgedNep21Address(erc20Address),
    { viewMethods: ['get_balance'] }
  )

  nep21Balances[erc20Address] =
    await nep21.get_balance({ owner_id: window.nearUserAddress })
      .then(raw => Number(raw))
      .catch(() => null)

  return nep21Balances[erc20Address]
}

const erc20Names = {}
export async function getErc20Name (address) {
  if (erc20Names[address]) return erc20Names[address]

  const contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    address
  )

  erc20Names[address] = await contract.methods.symbol().call()
    .catch(() => address.slice(0, 5) + '…')

  return erc20Names[address]
}

const erc20Decimals = {}
export async function getErc20Decimals (address) {
  if (erc20Decimals[address]) return erc20Decimals[address]

  const contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    address
  )

  erc20Decimals[address] = Number(
    await contract.methods.decimals()
      .call()
      .catch(() => 0)
  )

  return erc20Decimals[address]
}

const erc20Icons = {}
export async function getErc20Icon (address) {
  if (erc20Icons[address]) return erc20Icons[address]

  const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
  erc20Icons[address] = await new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => resolve(null)
    img.src = url
  })

  return erc20Icons[address]
}

export async function getErc20Data (address) {
  const [balance, decimals, icon, name, nep21Balance] = await Promise.all([
    getErc20Balance(address),
    getErc20Decimals(address),
    getErc20Icon(address),
    getErc20Name(address),
    getNep21Balance(address)
  ])
  return {
    address,
    balance,
    decimals,
    icon,
    name,
    nep21Balance,
    nep21Name: name + 'ⁿ', // TODO: get from NEAR token metadata
    nep21Icon: null // TODO: get from NEAR token metadata
  }
}

let featuredErc20s
export async function getFeaturedErc20s () {
  if (featuredErc20s) return featuredErc20s

  const ethNetwork = await window.web3.eth.net.getNetworkType()

  featuredErc20s = (await Promise.all(
    JSON.parse(process.env.featuredErc20s)[ethNetwork].map(getErc20Data)
  )).reduce(
    (acc, token) => {
      acc[token.address] = token
      return acc
    },
    {}
  )
  return featuredErc20s
}
