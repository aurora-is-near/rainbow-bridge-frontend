import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'

import {
  checkStatusAll as checkTransferStatuses,
  setEthProvider
} from '@near~eth/client'
import render from './render'
import { onClick } from './domHelpers'

// SWAP IN YOUR OWN INFURA_ID FROM https://infura.io/dashboard/ethereum
const INFURA_ID = '9c91979e95cb4ef8a61eb029b4217a1a'

/*
  Web3 modal helps us "connect" external wallets:
*/
window.web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID
      }
    }
  }
})

async function login (provider) {
  window.web3 = new Web3(provider)
  const [ethUser] = await provider.request({ method: 'eth_requestAccounts' })
  window.ethUserAddress = ethUser

  window.ethInitialized = true

  render()

  if (window.nearInitialized) checkTransferStatuses({ loop: window.LOOP_INTERVAL })
}

async function loadWeb3Modal () {
  const provider = await window.web3Modal.connect()

  setEthProvider(provider)

  provider.on('accountsChanged', () => {
    login(provider)
  })

  login(provider)
}

onClick('authEthereum', loadWeb3Modal)

// on page load, check if user has already signed in via MetaMask
if (window.web3Modal.cachedProvider) {
  loadWeb3Modal()
}
