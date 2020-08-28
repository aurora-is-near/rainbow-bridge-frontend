import './auth-ethereum'
import './auth-near'
import { erc20, abi } from './getParams'
import { fill } from './domHelpers'

import getNearConfig from './nearConfig'
const { contractName, networkId, nodeUrl } = getNearConfig()

document.querySelector('[data-behavior=logout]').onclick = async function logout() {
  await window.web3Modal.clearCachedProvider()
  window.nearConnection.signOut()
  setTimeout(() => window.location.reload())
}

// Displaying the signed in flow container and fill in data
function signedInFlow() {
  clearInterval(authChecker)
  document.querySelector('#signed-out-flow').style.display = 'none'

  fill('eth-node-url').with('eth-node-url')
  fill('eth-erc20-address').with(erc20)
  fill('eth-erc20-abi-path').with(abi)
  fill('eth-locker-address').with('eth-locker-address')
  fill('eth-locker-abi-path').with('eth-locker-abi-path')
  fill('near-node-url').with(nodeUrl)
  fill('near-network-id').with(networkId)
  fill('near-fun-token-account').with(contractName)
  fill('near-client-account').with('near-client-account')

  document.querySelector('#signed-in-flow').style.display = 'block'
}

function checkAuth() {
  if (window.ethUserAddress && window.nearUserAddress) signedInFlow()
}

const authChecker = window.setInterval(checkAuth, 1000)
