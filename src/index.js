import './authEthereum'
import './authNear'
import { fill } from './domHelpers'
import { Contract } from '@ethersproject/contracts'

fill('ethNodeUrl').with(process.env.ethNodeUrl)
fill('ethErc20Address').with(process.env.ethErc20Address)
fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
fill('ethLockerAddress').with(process.env.ethLockerAddress)
fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
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
async function signedInFlow () {
  clearInterval(authChecker)
  document.querySelector('#signed-out-flow').style.display = 'none'

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)

  // how to get useful details about selected network in MetaMask?
  fill('ethNetworkName').with(window.ethProvider.network.name)

  window.erc20 = new Contract(
    process.env.ethErc20Address,
    JSON.parse(process.env.ethErc20AbiText),
    window.ethSigner
  )

  console.log({ erc20: window.erc20 })

  const erc20Balance = (await window.erc20.balanceOf(window.ethUserAddress)).toNumber()
  fill('erc20Balance').with(new Intl.NumberFormat().format(erc20Balance))

  document.querySelector('#signed-in-flow').style.display = 'flex'
}

function checkAuth () {
  if (window.ethUserAddress && window.nearUserAddress) signedInFlow()
}

const authChecker = window.setInterval(checkAuth, 500)
