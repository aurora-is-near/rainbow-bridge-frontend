import { fill } from './domHelpers'

// update the html based on user & data state
export default async function render () {
  fill('ethNodeUrl').with(process.env.ethNodeUrl)
  fill('ethErc20Address').with(process.env.ethErc20Address)
  fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
  fill('ethLockerAddress').with(process.env.ethLockerAddress)
  fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
  fill('nearNodeUrl').with(process.env.nearNodeUrl)
  fill('nearNetworkId').with(process.env.nearNetworkId)
  fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
  fill('nearClientAccount').with(process.env.nearClientAccount)

  // if not signed in with both eth & near, stop here
  if (!window.ethUserAddress || !window.nearUserAddress) return

  document.querySelector('#signed-out-flow').style.display = 'none'

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)

  // how to get useful details about selected network in MetaMask?
  fill('ethNetworkName').with((await window.ethProvider.getNetwork()).name)

  const erc20Balance = (await window.erc20.balanceOf(window.ethUserAddress)).toNumber()
  fill('erc20Balance').with(new Intl.NumberFormat().format(erc20Balance))

  document.querySelector('#signed-in-flow').style.display = 'flex'
}
