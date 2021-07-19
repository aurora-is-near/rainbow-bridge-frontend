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

switch (`${process.env.ethNetworkId}-${process.env.nearNetworkId}`) {
  case 'ropsten-testnet': window.bridgeName = 'Ropsten ↔︎ NEAR Testnet'; break
  case 'rinkeby-testnet': window.bridgeName = 'Rinkeby ↔︎ NEAR Testnet'; break
  case 'main-mainnet': window.bridgeName = 'Ethereum ↔︎ NEAR'; break
  default: window.bridgeName = 'Unknown'
}

window.addEventListener('load', function cleanUrlParams () {
  // When signing a Near tx, if user clicks goBack, then the dapp will think
  // it is waiting for the redirect to Near wallet, so clear url params so the
  // transfer can be marked FAILED and retried.
  const params = Object.keys(window.urlParams.get())
  if (
    (params.includes('withdrawing') || params.includes('minting')) &&
    !(params.includes('transactionHashes') || params.includes('errorCode'))
  ) {
    window.urlParams.clear()
  }
  // If a new token was bridged it is safe to clear transactionHashes
  if (params.includes('bridging')) { window.urlParams.clear() }
})

render()

transfers.onChange(render)

// Render when user clicks goBack
window.onpopstate = render

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
