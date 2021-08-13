import { keyStores, WalletConnection, Near } from 'near-api-js'

import {
  checkStatusAll as checkTransferStatuses,
  setNearConnection
} from '@near-eth/client'
import render from './render'
import { onClick } from './domHelpers'

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

setNearConnection(window.nearConnection)

// Getting the Account ID. If still unauthorized, it's an empty string
window.nearUserAddress = window.nearConnection.getAccountId()

onClick('authNear', () => {
  window.nearConnection.requestSignIn()
})

function login () {
  window.nearInitialized = true

  render()

  if (window.ethInitialized) checkTransferStatuses({ loop: window.LOOP_INTERVAL })
}

// The NEAR signin flow redirects from the current URL to NEAR Wallet,
// returning to the current URL afterward, so we can rely on this whole set of
// JS being re-evaluated after NEAR auth
if (window.nearUserAddress) login()
