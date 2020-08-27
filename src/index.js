import 'regenerator-runtime/runtime'

import { initContract, login, logout } from './utils'

import getConfig from './config'
const { contractName, networkId, nodeUrl } = getConfig(process.env.NODE_ENV || 'development')

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block'
}

// A helper function to update DOM elements that have a "data-behavior" attribute
// Search file for example use
const fill = selector => ({
  with: content =>
    Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
      .forEach(n => n.innerHTML = content)
})

const params = new URLSearchParams(window.location.search)
const erc20 = params.get('erc20')
const abi = params.get('abi')

// if erc20 or abi are missing, redirect to defaults
const DEFAULT_ERC20 = '0xdeadbeef'
const DEFAULT_ABI = '0xdeadbeef.json'
if (!erc20 || !abi) {
  window.location.replace(
    window.location.origin +
    window.location.pathname +
    `?erc20=${DEFAULT_ERC20}&abi=${DEFAULT_ABI}`
  )
}

// Displaying the signed in flow container and fill in data
function signedInFlow() {
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

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow()
    else signedOutFlow()
  })
  .catch(console.error)
