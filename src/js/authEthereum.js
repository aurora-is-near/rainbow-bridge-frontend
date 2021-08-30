import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers } from 'ethers'

import {
  checkStatusAll as checkTransferStatuses,
  setEthProvider,
  setSignerProvider
} from '@near-eth/client'
import render from './render'
import { onClick } from './domHelpers'
import { chainIdToEthNetwork } from './utils'

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
        infuraId: process.env.INFURA_ID
      }
    }
  },
  theme: theme
})

async function login () {
  const provider = await window.web3Modal.connect()
  window.provider = provider
  setEthProvider(new ethers.providers.InfuraProvider(
    process.env.ethNetworkId === 'main' ? 'mainnet' : process.env.ethNetworkId,
    process.env.INFURA_ID
  ))
  setSignerProvider(new ethers.providers.Web3Provider(provider, 'any'))

  if (provider.isMetaMask || provider.isImToken) {
    window.ethUserAddress = provider.selectedAddress
    window.connectedEthNetwork = chainIdToEthNetwork[parseInt(provider.chainId)]
  } else {
    window.ethUserAddress = provider.accounts[0]
    window.connectedEthNetwork = chainIdToEthNetwork[provider.chainId]
  }
  provider.on('accountsChanged', (accounts) => {
    window.ethUserAddress = accounts[0]
    window.location.reload()
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
