import './authEthereum'
import './authNear'
import { initDOMhandlers } from './domHelpers'
import { get as getParam, set as setParam } from './urlParams'
import render from './render'

if (!getParam('erc20')) {
  setParam({ erc20: process.env.featuredErc20s.split(',')[0] })
}

initDOMhandlers()
render()
