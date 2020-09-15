import { Contract, keyStores, WalletConnection, Near } from 'near-api-js'
import { createNearConnector } from 'rainbow-token-connector'

import render from './render'
import EthOnNearClient from './borsh/ethOnNearClient'

// Create a Near config object
const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  networkId: process.env.nearNetworkId,
  nodeUrl: process.env.nearNodeUrl,
  helperUrl: process.env.nearHelperUrl,
  walletUrl: process.env.nearWalletUrl
})

// Initialize main interface to NEAR network
window.nearConnection = new WalletConnection(near)

// Getting the Account ID. If still unauthorized, it's an empty string
window.nearUserAddress = window.nearConnection.getAccountId()

const button = document.querySelector('[data-behavior=authNear]')

button.onclick = function login () {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf. This works by creating a new access key for the user's
  // account and storing the private key in localStorage.
  window.nearConnection.requestSignIn(process.env.nearFunTokenAccount)
}

async function login () {
  const span = document.createElement('span')
  span.innerHTML = `Connected to NEAR as <code>${window.nearUserAddress}</code>`
  button.replaceWith(span)

  window.nep21 = await new Contract(
    window.nearConnection.account(),
    process.env.nearFunTokenAccount,
    {
      // View methods are read only
      viewMethods: ['get_balance'],
      // Change methods modify state but don't receive updated data
      changeMethods: ['mint_with_json']
    }
  )

  window.ethOnNearClient = await new EthOnNearClient(
    window.nearConnection.account(),
    process.env.nearClientAccount
  )

  window.tokenConnector = await createNearConnector(
    window.nearConnection.account(),
    {
      nearConnectorId: '???',
      nearEthProverId: process.env.nearProverAccount,
      ethConnectorAddress: '???'
    }
  )

  window.nearInitialized = true

  render()
}

// The NEAR signin flow redirects from the current URL to NEAR Wallet,
// returning to the current URL afterward, so we can rely on this whole set of
// JS being re-evaluated after NEAR auth
if (window.nearUserAddress) login()
