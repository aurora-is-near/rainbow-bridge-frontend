import BN from 'bn.js'
import { Contract as NearContract, utils } from 'near-api-js'
import './authEthereum'
import './authNear'
import { fill, hide, initDOMhandlers, show } from './domHelpers'
import { getErc20Name } from './ethHelpers'
import render from './render'
import * as urlParams from './urlParams'
import {
  get as getTransfers,
  initiate as initiateTransfer,
  humanStatusFor
} from './transfers'

// Can't import modules in <script> tags in files included via PostHTML 😞
window.BN = BN
window.fill = fill
window.getErc20Name = getErc20Name
window.getTransfers = getTransfers
window.hide = hide
window.humanStatusFor = humanStatusFor
window.initiateTransfer = initiateTransfer
window.NearContract = NearContract
window.parseNearAmount = utils.format.parseNearAmount
window.render = render
window.show = show
window.urlParams = urlParams

initDOMhandlers()
render()
