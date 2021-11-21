import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import * as naj from 'near-api-js'
import * as dom from './domHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from '@near-eth/client'
import * as nep141Xerc20 from '@near-eth/nep141-erc20'
import * as ethXnear from '@near-eth/near-ether'
import * as utils from './utils'
import syncTransfers from './autoSync'

dom.init()

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.Decimal = Decimal
window.dom = dom
window.nep141Xerc20 = nep141Xerc20
window.ethXnear = ethXnear
window.LOOP_INTERVAL = 12000
window.NearContract = naj.Contract
window.parseNearAmount = naj.utils.format.parseNearAmount
window.render = render
window.transfers = transfers
window.urlParams = urlParams
window.utils = utils
window.syncTransfers = syncTransfers

switch (`${process.env.ethNetworkId}-${process.env.nearNetworkId}`) {
  case 'ropsten-testnet': window.bridgeName = 'Ropsten ↔︎ NEAR Testnet'; break
  case 'rinkeby-testnet': window.bridgeName = 'Rinkeby ↔︎ NEAR Testnet'; break
  case 'goerli-testnet': window.bridgeName = 'Goerli ↔︎ NEAR Testnet'; break
  case 'main-mainnet': window.bridgeName = 'Ethereum ↔︎ NEAR'; break
  default: window.bridgeName = 'Unknown'
}

transfers.onChange(render)
transfers.setBridgeParams({
  nearEventRelayerMargin: Number(process.env.nearEventRelayerMargin),
  sendToNearSyncInterval: Number(process.env.sendToNearSyncInterval),
  sendToEthereumSyncInterval: Number(process.env.sendToEthereumSyncInterval),
  ethChainId: Number(process.env.ethChainId),
  erc20Abi: process.env.ethErc20AbiText,
  erc20LockerAddress: process.env.ethLockerAddress,
  erc20LockerAbi: process.env.ethLockerAbiText,
  nep141Factory: process.env.nearTokenFactoryAccount,
  nearTokenFactoryAccount: process.env.nearTokenFactoryAccount,
  nativeNEARLockerAddress: process.env.nativeNEARLockerAddress,
  eNEARAddress: process.env.eNEARAddress,
  eNEARAbi: process.env.eNEARAbiText,
  etherCustodianAddress: process.env.etherCustodianAddress,
  etherCustodianAbi: process.env.etherCustodianAbiText,
  auroraEvmAccount: process.env.auroraEvmAccount,
  etherExitToEthereumPrecompile: process.env.exitToEthereumPrecompile,
  ethClientAddress: process.env.ethClientAddress,
  ethClientAbi: process.env.ethNearOnEthClientAbiText,
  nearClientAccount: process.env.nearClientAccount
})

window.addEventListener('load', () => {
  const params = Object.keys(window.urlParams.get())
  console.log(params)
  // When redirecting from NEAR wallet, stay on the landing page
  if (params.includes('withdrawing') || params.includes('locking')) {
    window.urlParams.clear('erc20n')
  }
  // If the user clicks goBack in NEAR wallet, then the dapp will think
  // it is waiting for the redirect to Near wallet, so clear the transfer id (withdrawing | locking | minting | unlocking)
  // so that the transfer can be marked FAILED and retried.
  const transferIds = ['withdrawing', 'locking', 'minting', 'unlocking']
  if (
    (params.some(p => transferIds.includes(p))) &&
    !(params.includes('transactionHashes') || params.includes('errorCode'))
  ) {
    window.urlParams.clear(...transferIds)
  }
  // If a new token was bridged it is safe to clear transactionHashes
  if (params.includes('bridging')) { window.urlParams.clear('bridging', 'transactionHashes', 'errorCode', 'errorMessage') }

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
      transfers.checkStatusAll({ loop: window.LOOP_INTERVAL })
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
            transfers.checkStatusAll({ loop: window.LOOP_INTERVAL })
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
