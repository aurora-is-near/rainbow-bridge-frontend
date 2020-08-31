import { keyStores, WalletConnection, Near } from 'near-api-js'
import getConfig from './nearConfig'
const config = getConfig()

// Create a Near config object
const near = new Near({
  deps: {
    keyStore: new keyStores.BrowserLocalStorageKeyStore()
  },
  ...config
})

// Initializing Wallet based Account. It can work with NEAR testnet wallet that
// is hosted at https://wallet.testnet.near.org
window.nearConnection = new WalletConnection(near)

// Getting the Account ID. If still unauthorized, it's just empty string
window.nearUserAddress = window.nearConnection.getAccountId()

const button = document.querySelector('[data-behavior=authNear]')

// The NEAR signin flow redirects from the current URL to NEAR Wallet,
// returning to the current URL afterward, so we can rely on this whole set of
// JS being re-evaluated after NEAR auth
if (!window.nearUserAddress) {
  button.onclick = function login () {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf. This works by creating a new access key for the user's
    // account and storing the private key in localStorage.
    window.nearConnection.requestSignIn()
  }
} else {
  const span = document.createElement('span')
  span.innerHTML = `Connected to NEAR as <code>${window.nearUserAddress}</code>`
  button.replaceWith(span)
}
