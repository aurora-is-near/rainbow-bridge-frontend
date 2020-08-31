import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { Web3Provider } from '@ethersproject/providers'

// SWAP IN YOUR OWN INFURA_ID FROM https://infura.io/dashboard/ethereum
const INFURA_ID = '9c91979e95cb4ef8a61eb029b4217a1a'

/*
  Web3 modal helps us "connect" external wallets:
*/
window.web3Modal = new Web3Modal({
  // network: "mainnet", // optional
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

const button = document.querySelector('[data-behavior=authEthereum]')

async function loadWeb3Modal () {
  const provider = await window.web3Modal.connect()
  window.ethProvider = new Web3Provider(provider)
  window.ethSigner = window.ethProvider.getSigner()
  window.ethUserAddress = await window.ethSigner.getAddress()

  const span = document.createElement('span')
  span.innerHTML = `Connected to Ethereum as <code>${window.ethUserAddress}</code>`
  button.replaceWith(span)
}

button.onclick = loadWeb3Modal

// on page load, check if user has already signed in via MetaMask
if (window.web3Modal.cachedProvider) {
  loadWeb3Modal()
}
