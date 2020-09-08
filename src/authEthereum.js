import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'

import render from './render'
import { checkStatuses as checkTransferStatuses } from './transfers'

// SWAP IN YOUR OWN INFURA_ID FROM https://infura.io/dashboard/ethereum
const INFURA_ID = '9c91979e95cb4ef8a61eb029b4217a1a'

/*
  Web3 modal helps us "connect" external wallets:
*/
window.web3Modal = new Web3Modal({
  network: process.env.ethNodeUrl, // optional
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
  window.web3 = new Web3(provider)
  window.ethUserAddress = (await window.web3.eth.getAccounts())[0]

  window.erc20 = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    process.env.ethErc20Address,
    { from: window.ethUserAddress }
  )

  window.tokenLocker = new window.web3.eth.Contract(
    JSON.parse(process.env.ethLockerAbiText),
    process.env.ethLockerAddress,
    { from: window.ethUserAddress }
  )

  const span = document.createElement('span')
  span.innerHTML = `Connected to Ethereum as <code>${window.ethUserAddress}</code>`
  button.replaceWith(span)
  render()

  // start checking statuses of in-flight transfers after both NEAR & Ethereum
  // logins complete – if NEAR login not yet done, this is a no-op
  checkTransferStatuses(render)
}

button.onclick = loadWeb3Modal

// on page load, check if user has already signed in via MetaMask
if (window.web3Modal.cachedProvider) {
  loadWeb3Modal()
}
