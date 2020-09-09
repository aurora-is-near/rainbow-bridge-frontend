import './authEthereum'
import './authNear'
import { initDOMhandlers } from './domHelpers'
import render from './render'
import { checkStatuses as checkTransferStatuses } from './transfers'

initDOMhandlers()
render()
setTimeout(() => checkTransferStatuses(render), 500)
