import './authEthereum'
import './authNear'
import { fill } from './domHelpers'

fill('ethNodeUrl').with(process.env.ethNodeUrl)
fill('ethErc20Address').with(process.env.ethErc20Address)
fill('ethErc20AbiPath').with(process.env.ethErc20AbiPath)
fill('ethLockerAddress').with(process.env.ethLockerAddress)
fill('ethLockerAbiPath').with(process.env.ethLockerAbiPath)
fill('nearNodeUrl').with(process.env.nearNodeUrl)
fill('nearNetworkId').with(process.env.nearNetworkId)
fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
fill('nearClientAccount').with(process.env.nearClientAccount)

document.querySelector('[data-behavior=logout]').onclick = async function logout () {
  await window.web3Modal.clearCachedProvider()
  window.nearConnection.signOut()
  setTimeout(() => window.location.reload())
}

// Displaying the signed in flow container and fill in data
function signedInFlow () {
  clearInterval(authChecker)
  document.querySelector('#signed-out-flow').style.display = 'none'

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)

  // how to get useful details about selected network in MetaMask?
  fill('ethNetworkName').with(window.ethProvider.network.name)

  document.querySelector('#signed-in-flow').style.display = 'block'
}

function checkAuth () {
  if (window.ethUserAddress && window.nearUserAddress) signedInFlow()
}

const authChecker = window.setInterval(checkAuth, 500)
