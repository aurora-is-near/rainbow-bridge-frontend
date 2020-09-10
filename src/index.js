import './authEthereum'
import './authNear'
import { initDOMhandlers } from './domHelpers'
import render from './render'
import { checkStatuses as checkTransferStatuses } from './transfers'

initDOMhandlers()
render()

// once Ethereum & NEAR contracts have been fully initialized,
// start checking transfers
const loginCheck = window.setInterval(
  () => {
    if (window.ethInitialized && window.nearInitialized) {
      window.clearInterval(loginCheck)
      checkTransferStatuses(render)
    }
  },
  500
)
