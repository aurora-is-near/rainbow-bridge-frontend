import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

import {
  checkStatusAll as checkTransferStatuses,
  setEthProvider
} from '@near-eth/client'
import render from './render'
import { onClick } from './domHelpers'
import { chainIdToEthNetwork } from './utils'

// SWAP IN YOUR OWN INFURA_ID FROM https://infura.io/dashboard/ethereum
const INFURA_ID = '9c91979e95cb4ef8a61eb029b4217a1a'

/*
  Web3 modal helps us "connect" external wallets:
*/
let theme = 'light'
if (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
  theme = 'dark'
};
window.web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID
      }
    }
  },
  theme: theme
})

async function login () {
  const provider = await window.web3Modal.connect()
  setEthProvider(provider)

  if (provider.isMetaMask) {
    window.ethUserAddress = provider.selectedAddress
    window.connectedEthNetwork = chainIdToEthNetwork[parseInt(provider.chainId)]
  } else {
    window.ethUserAddress = provider.accounts[0]
    window.connectedEthNetwork = chainIdToEthNetwork[provider.chainId]
  }
  provider.on('accountsChanged', (accounts) => {
    window.ethUserAddress = accounts[0]
    render()
  })
  provider.on('chainChanged', (chainId) => {
    window.connectedEthNetwork = chainIdToEthNetwork[parseInt(chainId)]
    window.isValidEthNetwork = window.connectedEthNetwork === process.env.ethNetworkId
    render()
  })
  provider.on('disconnect', (code, reason) => {
    console.log(code, reason)
    setTimeout(() => window.location.reload())
    window.web3Modal.clearCachedProvider()
    render()
  })

  window.isValidEthNetwork = window.connectedEthNetwork === process.env.ethNetworkId
  window.ethInitialized = true

  render()

  if (window.nearInitialized) checkTransferStatuses({ loop: window.LOOP_INTERVAL })
}

onClick('authEthereum', login)
onClick('switchEthWallet', async () => {
  window.ethInitialized = false
  await window.web3Modal.clearCachedProvider()
  localStorage.removeItem('walletconnect')
  window.dom.hide('unsupportedNetworkModal')
  try {
    await login()
  } catch (error) {
    // user closed modal without selecting wallet
    window.location.reload()
  }
})

// on page load, check if user has already signed in via MetaMask
if (window.web3Modal.cachedProvider) {
  login()
}
