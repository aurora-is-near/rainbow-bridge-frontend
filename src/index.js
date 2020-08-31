import './authEthereum'
import './authNear'
import { erc20, abi } from './getParams'
import { fill } from './domHelpers'

import getNearConfig from './nearConfig'
const { contractName, networkId, nodeUrl } = getNearConfig()

document.querySelector('[data-behavior=logout]').onclick = async function logout () {
  await window.web3Modal.clearCachedProvider()
  window.nearConnection.signOut()
  setTimeout(() => window.location.reload())
}

// Displaying the signed in flow container and fill in data
function signedInFlow () {
  clearInterval(authChecker)
  document.querySelector('#signed-out-flow').style.display = 'none'

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)
  fill('ethNodeUrl').with('ethNodeUrl')
  fill('ethErc20Address').with(erc20)
  fill('ethErc20AbiPath').with(abi)
  fill('ethLockerAddress').with('ethLockerAddress')
  fill('ethLockerAbiPath').with('ethLockerAbiPath')
  fill('nearNodeUrl').with(nodeUrl)
  fill('nearNetworkId').with(networkId)
  fill('nearFunTokenAccount').with(contractName)
  fill('nearClientAccount').with('nearClientAccount')

  document.querySelector('#signed-in-flow').style.display = 'block'
}

function checkAuth () {
  if (window.ethUserAddress && window.nearUserAddress) signedInFlow()
}

const authChecker = window.setInterval(checkAuth, 500)
