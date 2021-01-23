import { fill } from './domHelpers'

// update the html based on user & data state
export default async function render () {
  fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
  fill('ethLockerAddress').with(process.env.ethLockerAddress)
  fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
  fill('nearNodeUrl').with(process.env.nearNodeUrl)
  fill('nearNetworkId').with(process.env.nearNetworkId)
  fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
  fill('nearClientAccount').with(process.env.nearClientAccount)

  if (window.ethUserAddress) {
    window.dom.fill('ethUser').with({
      innerHTML: window.ethUserAddress,
      title: window.ethUserAddress
    })
  }
  if (window.nearUserAddress) {
    window.dom.fill('nearUser').with({
      innerHTML: window.nearUserAddress,
      title: window.nearUserAddress
    })
  }

  await Promise.all(window.renderers.map(r => r()))
}
