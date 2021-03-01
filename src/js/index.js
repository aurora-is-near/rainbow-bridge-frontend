import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import * as naj from 'near-api-js'
import * as dom from './domHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from '@near-eth/client'
import * as nep141Xerc20 from '@near-eth/nep141-erc20'
import * as utils from './utils'

dom.init()

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.Decimal = Decimal
window.dom = dom
window.nep141Xerc20 = nep141Xerc20
window.LOOP_INTERVAL = 5500
window.NearContract = naj.Contract
window.parseNearAmount = naj.utils.format.parseNearAmount
window.render = render
window.transfers = transfers
window.urlParams = urlParams
window.utils = utils

if (process.env.nearNetworkId === 'testnet' &&
    process.env.ethNetworkId === 'ropsten') {
  window.bridgeName = 'Near Testnet - Ropsten'
} else if (process.env.nearNetworkId === 'testnet' &&
    process.env.ethNetworkId === 'rinkeby') {
  window.bridgeName = 'Near Testnet - Rinkeby'
} else if (process.env.nearNetworkId === 'mainnet' &&
    process.env.ethNetworkId === 'main') {
  window.bridgeName = 'Near - Ethereum'
} else {
  window.bridgeName = 'Unknown'
}

render()

transfers.onChange(render)

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
