import './authEthereum'
import './authNear'
import { fill, hide, initDOMhandlers, show } from './domHelpers'
import { get as getParam, set as setParam } from './urlParams'
import render from './render'
import {
  get as getTransfers,
  initiate as initiateTransfer,
  humanStatusFor
} from './transfers'

// Can't import modules in <script> tags in files included via PostHTML 😞
window.fill = fill
window.getParam = getParam
window.getTransfers = getTransfers
window.hide = hide
window.humanStatusFor = humanStatusFor
window.initiateTransfer = initiateTransfer
window.render = render
window.show = show

if (!getParam('erc20')) {
  setParam({ erc20: process.env.featuredErc20s.split(',')[0] })
}

initDOMhandlers()
render()
