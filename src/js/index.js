import BN from 'bn.js'
import * as naj from 'near-api-js'
import './authEthereum'
import './authNear'
import { find, findAll, fill, hide, initDOMhandlers, onClick, show, toString } from './domHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from './transfers'
import * as erc20Xnep21 from './transfers/erc20+nep21'
import * as utils from './utils'

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.erc20Xnep21 = erc20Xnep21
window.find = find
window.findAll = findAll
window.fill = fill
window.hide = hide
window.LOOP_INTERVAL = 5500
window.NearContract = naj.Contract
window.onClick = onClick
window.parseNearAmount = naj.utils.format.parseNearAmount
window.render = render
window.show = show
window.toString = toString
window.transfers = transfers
window.urlParams = urlParams
window.utils = utils

render()

transfers.onChange(render)
