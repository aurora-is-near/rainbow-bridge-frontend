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

render()

transfers.onChange(render)
transfers.setBridgeParams({
  auroraErc20Abi: process.env.auroraErc20AbiText,
  auroraEvmAccount: process.env.auroraEvmAccount,
  etherExitToNearPrecompile: process.env.etherExitToNearPrecompile,
  wNearNep141: process.env.wNearNep141,
  auroraChainId: Number(process.env.auroraChainId)
})

// Render when user clicks goBack
window.onpopstate = render

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
