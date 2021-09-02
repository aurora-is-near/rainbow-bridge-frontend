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
import syncTransfers from './autoSync'

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
window.syncTransfers = syncTransfers

switch (`${process.env.ethNetworkId}-${process.env.nearNetworkId}`) {
  case 'ropsten-testnet': window.bridgeName = 'Ropsten ↔︎ NEAR Testnet'; break
  case 'rinkeby-testnet': window.bridgeName = 'Rinkeby ↔︎ NEAR Testnet'; break
  case 'goerli-testnet': window.bridgeName = 'Goerli ↔︎ NEAR Testnet'; break
  case 'main-mainnet': window.bridgeName = 'Ethereum ↔︎ NEAR'; break
  default: window.bridgeName = 'Unknown'
}

const params = Object.keys(window.urlParams.get())
// When redirecting from NEAR wallet, stay on the landing page
if (params.includes('withdrawing') || params.includes('locking')) {
  window.urlParams.clear('erc20n')
}
// If the user clicks goBack in NEAR wallet, then the dapp will think
// it is waiting for the redirect to Near wallet, so clear the transfer id (withdrawing | locking | minting | unlocking)
// so that the transfer can be marked FAILED and retried.
const transferIds = ['withdrawing', 'locking', 'minting', 'unlocking']
if (
  (params.some(p => transferIds.includes(p))) &&
  !(params.includes('transactionHashes') || params.includes('errorCode'))
) {
  window.urlParams.clear(...transferIds)
}
// If a new token was bridged it is safe to clear transactionHashes
if (params.includes('bridging')) { window.urlParams.clear('bridging', 'transactionHashes', 'errorCode', 'errorMessage', 'erc20', 'erc20n') }

render()

transfers.onChange(render)
transfers.setBridgeParams({
  nearEventRelayerMargin: Number(process.env.nearEventRelayerMargin),
  sendToNearSyncInterval: Number(process.env.sendToNearSyncInterval),
  sendToEthereumSyncInterval: Number(process.env.sendToEthereumSyncInterval),
  ethChainId: Number(process.env.ethChainId),
  erc20Abi: process.env.ethErc20AbiText,
  erc20LockerAddress: process.env.ethLockerAddress,
  erc20LockerAbi: process.env.ethLockerAbiText,
  nep141Factory: process.env.nearTokenFactoryAccount,
  nativeNEARLockerAddress: process.env.nativeNEARLockerAddress,
  eNEARAddress: process.env.eNEARAddress,
  eNEARAbi: process.env.eNEARAbiText,
  etherCustodianAddress: process.env.etherCustodianAddress,
  etherCustodianAbi: process.env.etherCustodianAbiText,
  auroraEvmAccount: process.env.auroraEvmAccount,
  etherExitToEthereumPrecompile: process.env.exitToEthereumPrecompile,
  ethClientAddress: process.env.ethClientAddress,
  ethClientAbi: process.env.ethNearOnEthClientAbiText,
  nearClientAccount: process.env.nearClientAccount
})

// Render when user clicks goBack
window.onpopstate = render

// These have side effects and may cause `render` calls which expect all
// `window` additions above to be in place. Load last.
require('./authEthereum')
require('./authNear')
