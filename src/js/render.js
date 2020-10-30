import { fill, hide, show } from './domHelpers'
import { get as getParam } from './urlParams'
import { getErc20Name } from './ethHelpers'

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

  const ethErc20Address = getParam('erc20')
  const ethErc20Name = await getErc20Name(ethErc20Address)

  fill('ethErc20Name').with(ethErc20Name)
  fill('ethErc20Address').with(ethErc20Address)
  fill('nearNep21Name').with('n' + ethErc20Name)

  await Promise.all(window.renderers.map(r => r()))

  hide('signed-out')
  show('signed-in')
}
