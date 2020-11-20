import { Contract, keyStores, WalletConnection, Near } from 'near-api-js'

import { checkStatuses as checkTransferStatuses } from './transfers'
import * as storage from './transfers/storage'
import { processWithdrawTx, INITIALIZED } from './transfers/bridged-nep21-to-erc20'
import EthOnNearClient from './borsh/ethOnNearClient'
import render from './render'

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

  if (window.ethInitialized) {
    window.nearConnection.inFlightTransactions.drain(({ meta, tx }) => {
      const transfer = storage.get(meta.id)

      if (transfer.nep21FromErc20 && transfer.status === INITIALIZED) {
        processWithdrawTx(transfer, tx)
      }
    })
    checkTransferStatuses(render)
  }
}

// The NEAR signin flow redirects from the current URL to NEAR Wallet,
// returning to the current URL afterward, so we can rely on this whole set of
// JS being re-evaluated after NEAR auth
if (window.nearUserAddress) login()
