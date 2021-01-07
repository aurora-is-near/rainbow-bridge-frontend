import { fill, hide, show } from './domHelpers'

// update the html based on user & data state
export default async function render () {
  fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
  fill('ethLockerAddress').with(process.env.ethLockerAddress)
  fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
  fill('nearNodeUrl').with(process.env.nearNodeUrl)
  fill('nearNetworkId').with(process.env.nearNetworkId)
  fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
  fill('nearClientAccount').with(process.env.nearClientAccount)

  // if not signed in with both eth & near, stop here
  if (!window.ethUserAddress || !window.nearUserAddress) return

  window.fill('ethUser').with(window.ethUserAddress)
  window.fill('nearUser').with(window.nearUserAddress)

  await Promise.all(window.renderers.map(r => r()))

  hide('signed-out')
  show('signed-in')
}
