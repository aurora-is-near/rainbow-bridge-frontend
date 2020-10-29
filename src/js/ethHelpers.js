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
