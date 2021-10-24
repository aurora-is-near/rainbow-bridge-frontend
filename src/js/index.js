import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import * as naj from 'near-api-js'
import * as dom from './domHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from '@near-eth/client'
import * as nearXaurora from '@near-eth/aurora-nep141'
// import * as nep141Xerc20 from '@near-eth/nep141-erc20'
// import * as eNEAR from '@near-eth/near-ether'
import * as utils from './utils'

dom.init()

// Set custom transfer types to use @near-eth/client for tracking and checking transaction status.
// Deprecated: set old transfer types to not break the app when decorating old transfers.
transfers.setTransferTypes({
  'aurora<>near/sendToNear': require('@near-eth/aurora-nep141/dist/bridged-erc20/sendToNear'),
  'aurora<>near/sendToAurora': require('@near-eth/aurora-nep141/dist/natural-nep141/sendToAurora')
})

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.Decimal = Decimal
window.dom = dom
window.nearXaurora = nearXaurora
// window.nep141Xerc20 = nep141Xerc20
// window.eNEAR = eNEAR
window.LOOP_INTERVAL = 5500
window.NearContract = naj.Contract
window.parseNearAmount = naj.utils.format.parseNearAmount
window.render = render
window.transfers = transfers
window.urlParams = urlParams
window.utils = utils

switch (`${process.env.nearNetworkId}-${process.env.ethNetworkId}`) {
  case 'testnet-aurora': window.bridgeName = 'Aurora Testnet ↔︎ NEAR Testnet'; break
  case 'mainnet-aurora': window.bridgeName = 'Aurora ↔︎ NEAR'; break
  default: window.bridgeName = 'Unknown'
}

transfers.onChange(render)
transfers.setBridgeParams({
  auroraErc20Abi: process.env.auroraErc20AbiText,
  auroraEvmAccount: process.env.auroraEvmAccount,
  etherExitToNearPrecompile: process.env.etherExitToNearPrecompile,
  wNearNep141: process.env.wNearNep141,
  auroraChainId: Number(process.env.auroraChainId)
})

window.addEventListener('load', async () => {
  const params = Object.keys(window.urlParams.get())
  // When redirecting from NEAR wallet, stay on the landing page
  if (params.includes('locking')) {
    window.urlParams.clear('erc20n')
  }
  // If the user clicks goBack in NEAR wallet, then the dapp will think
  // it is waiting for the redirect to Near wallet, so clear the transfer id (locking)
  // so that the transfer can be marked FAILED and retried.
  if (
    (params.includes('locking')) &&
    !(params.includes('transactionHashes') || params.includes('errorCode'))
  ) {
    window.urlParams.clear('locking', 'erc20', 'erc20n')
  }

  if (params.includes('bridging')) {
    if (params.includes('errorCode') || params.includes('errorMessage')) {
      window.dom.toast(
        `${decodeURI(window.urlParams.get('errorMessage'))}.`,
        null,
        'toastError'
      )
    } else if (params.includes('transactionHashes')) {
      window.dom.toast(
        'Success! Check the transaction status from your NEAR wallet.',
        `https://explorer.${process.env.nearNetworkId}.near.org/transactions/${window.urlParams.get('transactionHashes')}`
      )
    }
    window.urlParams.clear('bridging', 'transactionHashes', 'errorCode', 'errorMessage')
  }

  // When redirecting to NEAR wallet, url-params are set.
  // But if another tab is open with checkTransferStatuses running it will mark the transfer as failed
  // because it is expecting correct url-params for an in-progress transfer and that tab doesn't have them.
  // So before starting checkTransferStatuses, the tab makes sure that it is allowed to do so by getting a session.
  // The tab owning the session rejects other session requests.
  // If a session request is not rejected within 6s we can assume there is no other tab currently owning the session.
  const getSession = () => {
    const sessionId = window.sessionStorage.getItem('session-id')
    if (sessionId && (sessionId === window.localStorage.getItem('session-id'))) {
      // Page re-load, NEAR Wallet redirect ... the current tab owns the session.
      transfers.checkStatusAll({ loop: 12000 })
    } else {
      // Try to get a new session. If another tab is already open, it will reject the session request from checkSessionRequests()
      const newSessionId = Date.now().toString()
      window.localStorage.setItem('session-requested', newSessionId)
      window.setTimeout(
        function checkSessionIsAllowed () {
          // Create a new session if the session request wan't rejected.
          if (window.localStorage.getItem('session-requested') === newSessionId) {
            window.localStorage.setItem('session-id', newSessionId)
            window.sessionStorage.setItem('session-id', newSessionId)
            window.localStorage.removeItem('session-requested')
            transfers.checkStatusAll({ loop: 12000 })
          } else {
            alert('Another tab or window is open ! Please make sure you open this dapp in a single tab.')
            getSession()
          }
        },
        6000
      )
    }
  }
  const checkSessionRequests = () => {
    // Reject the request if the current tab is already the session owner
    if (window.sessionStorage.getItem('session-id') && window.localStorage.getItem('session-requested')) {
      window.localStorage.removeItem('session-requested')
    }
    window.setTimeout(checkSessionRequests, 2000)
  }
  getSession()
  checkSessionRequests()
})

render()

// Render when user clicks goBack
window.onpopstate = render

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
