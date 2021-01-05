import { Contract, keyStores, WalletConnection, Near } from 'near-api-js'

import { checkStatuses as checkTransferStatuses } from './transfers'
import EthOnNearClient from './borsh/ethOnNearClient'
import render from './render'
import { find, onClick } from './domHelpers'

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

// Allow the current app to make calls to the specified contract on the
// user's behalf. This works by creating a new access key for the user's
// account and storing the private key in localStorage.
onClick('authNear', () => {
  window.nearConnection.requestSignIn(process.env.nearFunTokenAccount)
})

async function login () {
  const span = document.createElement('span')
  span.innerHTML = `<span class="connected-account" title="${window.nearUserAddress}">${window.nearUserAddress}</span>`
  find('authNear').replaceWith(span)

  window.nearFungibleTokenFactory = await new Contract(
    window.nearConnection.account(),
    process.env.nearTokenFactoryAccount,
    {
      // Change methods update contract state, but cannot return data
      changeMethods: ['deposit', 'deploy_bridge_token']
    }
  )

  window.ethOnNearClient = new EthOnNearClient(await new Contract(
    window.nearConnection.account(),
    process.env.nearClientAccount,
    {
      // View methods are read only
      viewMethods: ['last_block_number']
    }
  ))

  window.nearInitialized = true

  render()

  if (window.ethInitialized) checkTransferStatuses()
}

// The NEAR signin flow redirects from the current URL to NEAR Wallet,
// returning to the current URL afterward, so we can rely on this whole set of
// JS being re-evaluated after NEAR auth
if (window.nearUserAddress) login()
