export const formatLargeNum = n => n >= 1e5 || (n < 1e-3 && n !== 0)
  ? n.toExponential(2)
  : new Intl.NumberFormat(undefined, { maximumSignificantDigits: 5 }).format(n)

export async function getErc20Balance (erc20Address) {
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    erc20Address,
    { from: window.ethUserAddress }
  )

  return Number(
    await erc20Contract.methods.balanceOf(window.ethUserAddress).call()
  )
}

export function getBridgedNep21Address (erc20Address) {
  return erc20Address.replace('0x', '').toLowerCase() +
      '.' +
      process.env.nearTokenFactoryAccount
}

export async function getNep21Balance (erc20Address) {
  const nep21 = await new window.NearContract(
    window.nearConnection.account(),
    getBridgedNep21Address(erc20Address),
    { viewMethods: ['get_balance'] }
  )

  return nep21.get_balance({ owner_id: window.nearUserAddress })
    .then(raw => Number(raw))
    .catch(() => null)
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
