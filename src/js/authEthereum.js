import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import {
  checkStatusAll as checkTransferStatuses,
  setAuroraProvider,
  setSignerProvider
} from '@near-eth/client'
import render from './render'
import { onClick } from './domHelpers'

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
  theme: theme
})

export const AURORA_CHAIN = Number(process.env.auroraChainId)
const capitalizeNetworkName = name => name.charAt(0).toUpperCase() + name.slice(1)
const AURORA_CHAIN_PARAMS = {
  chainId: '0x' + AURORA_CHAIN.toString(16),
  chainName: 'Aurora ' + capitalizeNetworkName(process.env.nearNetworkId),
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: [process.env.auroraRpc],
  blockExplorerUrls: null // TODO
}

export async function connectAurora () {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [AURORA_CHAIN_PARAMS]
  })
}

async function login () {
  const provider = await window.web3Modal.connect()
  window.web3Provider = new ethers.providers.Web3Provider(provider, 'any')
  setAuroraProvider(new ethers.providers.JsonRpcProvider(process.env.auroraRpc))
  setSignerProvider(window.web3Provider)
  if (provider.isMetaMask) {
    window.ethUserAddress = provider.selectedAddress
    window.connectedEthNetwork = parseInt(provider.chainId)
  } else {
    window.ethUserAddress = provider.accounts[0]
    window.connectedEthNetwork = parseInt(provider.chainId)
  }
  provider.on('accountsChanged', (accounts) => {
    window.ethUserAddress = accounts[0]
    render()
  })
  provider.on('chainChanged', async (chainId) => {
    // The cached provider in local storage is deleted when changing to a custom network.
    await window.web3Modal.connect()
    window.connectedEthNetwork = parseInt(chainId)
    window.isValidEthNetwork = parseInt(chainId) === parseInt(process.env.auroraChainId)
    render()
  })
  provider.on('disconnect', (code, reason) => {
    console.log(code, reason)
    window.web3Modal.clearCachedProvider()
    render()
  })
  await connectAurora()

  window.isValidEthNetwork = window.connectedEthNetwork === parseInt(process.env.auroraChainId)
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
