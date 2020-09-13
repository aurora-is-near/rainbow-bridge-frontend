import './authEthereum'
import './authNear'
import { initDOMhandlers } from './domHelpers'
import render from './render'
import { checkStatuses as checkTransferStatuses } from './transfers'

initDOMhandlers()
render()

// once Ethereum & NEAR contracts have been fully initialized,
// start checking transfers. If no transfers, this is a no-op.
window.setTimeout(
  () => {
    if (window.ethInitialized && window.nearInitialized) {
      checkTransferStatuses(render)
    }
  },
  5000
)
