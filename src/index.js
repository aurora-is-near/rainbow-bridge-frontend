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

// Displaying the signed in flow container and fill in data
function signedInFlow() {
  Array.from(document.querySelectorAll('[data-behavior=eth-node-url]'))
    .forEach(n => n.innerHTML = 'eth-node-url')
  Array.from(document.querySelectorAll('[data-behavior=eth-erc20-address]'))
    .forEach(n => n.innerHTML = 'eth-erc20-address')
  Array.from(document.querySelectorAll('[data-behavior=eth-erc20-abi-path]'))
    .forEach(n => n.innerHTML = 'eth-erc20-abi-path')
  Array.from(document.querySelectorAll('[data-behavior=eth-locker-address]'))
    .forEach(n => n.innerHTML = 'eth-locker-address')
  Array.from(document.querySelectorAll('[data-behavior=eth-locker-abi-path]'))
    .forEach(n => n.innerHTML = 'eth-locker-abi-path')
  Array.from(document.querySelectorAll('[data-behavior=near-node-url]'))
    .forEach(n => n.innerHTML = 'near-node-url')
  Array.from(document.querySelectorAll('[data-behavior=near-network-id]'))
    .forEach(n => n.innerHTML = 'near-network-id')
  Array.from(document.querySelectorAll('[data-behavior=near-fun-token-account]'))
    .forEach(n => n.innerHTML = 'near-fun-token-account')
  Array.from(document.querySelectorAll('[data-behavior=near-client-account]'))
    .forEach(n => n.innerHTML = 'near-client-account')

  document.querySelector('#signed-in-flow').style.display = 'block'
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow()
    else signedOutFlow()
  })
  .catch(console.error)
