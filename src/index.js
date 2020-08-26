import 'regenerator-runtime/runtime'

import { initContract, login, logout } from './utils'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

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

// Displaying the signed in flow container and fill in data
function signedInFlow() {
  fill('eth-node-url').with('eth-node-url')
  fill('eth-erc20-address').with('eth-erc20-address')
  fill('eth-erc20-abi-path').with('eth-erc20-abi-path')
  fill('eth-locker-address').with('eth-locker-address')
  fill('eth-locker-abi-path').with('eth-locker-abi-path')
  fill('near-node-url').with('near-node-url')
  fill('near-network-id').with('near-network-id')
  fill('near-fun-token-account').with('near-fun-token-account')
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
