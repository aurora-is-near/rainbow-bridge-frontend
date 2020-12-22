import BN from 'bn.js'
import { Contract as NearContract, utils } from 'near-api-js'
import './authEthereum'
import './authNear'
import { fill, hide, initDOMhandlers, show } from './domHelpers'
import { getErc20Name } from './ethHelpers'
import render from './render'
import * as urlParams from './urlParams'
import * as transfers from './transfers'

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.fill = fill
window.getErc20Name = getErc20Name
window.hide = hide
window.NearContract = NearContract
window.parseNearAmount = utils.format.parseNearAmount
window.render = render
window.show = show
window.transfers = transfers
window.urlParams = urlParams

initDOMhandlers()
render()

transfers.onChange(render)
