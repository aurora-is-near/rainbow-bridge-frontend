import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import * as naj from 'near-api-js'
import * as dom from './domHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from '@near-eth/client'
import * as nearXaurora from './near-aurora'
// import * as nep141Xerc20 from '@near-eth/nep141-erc20'
// import * as eNEAR from '@near-eth/near-ether'
import * as utils from './utils'

dom.init()

// Set custom transfer types to use @near-eth/client for tracking and checking transaction status.
transfers.setTransferTypes({
  [nearXaurora.bridgedErc20.TRANSFER_TYPE]: nearXaurora.bridgedErc20,
  [nearXaurora.naturalNep141.TRANSFER_TYPE]: nearXaurora.naturalNep141
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

window.addEventListener('load', function cleanUrlParams () {
  /*
  window.urlParams.clear('transactionHashes', 'errorCode', 'errorMessage')
  const currentParams = Object.keys(window.urlParams.get())
  // window.urlParams.setPush([], true)
  window.urlParams.setPush(currentParams, true)
  */
  // When signing a Near tx, if user clicks goBack, then the dapp will think
  // it is waiting for the redirect to Near wallet, so clear url params so the
  // transfer can be marked FAILED and retried.
  const params = Object.keys(window.urlParams.get())
  /*
  if (params.includes('transactionHashes')) {
    window.dom.toast(
      'Transfer submitted! Check the transaction status from your NEAR wallet.',
      `https://explorer.testnet.near.org/transactions/${window.urlParams.get('transactionHashes')}`
    )
    window.urlParams.clear()
  }
  */
  if (params.includes('bridging')) {
    if (params.includes('errorCode') || params.includes('errorMessage')) {
      window.dom.toast(
        `${decodeURI(window.urlParams.get('errorMessage'))}.`,
        null,
        'toastError'
      )
      window.urlParams.clear('errorCode', 'errorMessage')
    } else {
      window.dom.toast(
        'Token registration transaction submitted! Check the transaction status from your NEAR wallet.',
        `https://explorer.testnet.near.org/transactions/${window.urlParams.get('transactionHashes')}`
      )
    }
    window.urlParams.clear('bridging')
  }
  /*
  if (params.includes('errorCode') || params.includes('errorMessage')) {
  const currentParams = window.urlParams.get()
  window.urlParams.clear()
  if (Object.keys(currentParams).length > 0) {
    window.urlParams.setPush(currentParams, true)
  }
  */
})

render()

transfers.onChange(render)

// Render when user clicks goBack
window.onpopstate = render

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
