import jwtDecode from 'jwt-decode'
import { getEthProvider } from '@near-eth/client/dist/utils'
import Web3 from 'web3'
import * as naj from 'near-api-js'
import { Decimal } from 'decimal.js'

// TODO: update urls
const FAUCET_URL = 'http://95.216.165.53:3456/api'
const CLAIM_URL = 'https://wallet.testnet.near.org/create/testnet/'

export async function checkETHBalance () {
  const web3 = new Web3(getEthProvider())

  const ethBalance = await web3.eth.getBalance(window.ethUserAddress)
  if (Decimal(ethBalance).comparedTo(Decimal(0.05).mul(Decimal.pow(10, 18))) < 0) {
    throw new Error('0.05 ETH are needed to claim a free NEAR account')
  }
  return ethBalance
}

export async function parasFaucetLogin () {
  const web3 = new Web3(getEthProvider())

  // check if user already exists
  let response = await fetch(
    `${FAUCET_URL}/users?publicAddress=${window.ethUserAddress.toLowerCase()}`
  )
  if (!response.ok) {
    throw new Error('Failed to connect to faucet')
  }
  let [user] = await response.json()

  // signup user if does not exist
  if (!user) {
    const response = await fetch(`${FAUCET_URL}/users`, {
      body: JSON.stringify({ publicAddress: window.ethUserAddress.toLowerCase() }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error('Failed to connect to faucet')
    }
    user = await response.json()
  }

  // sign nonce
  let signature
  try {
    signature = await web3.eth.personal.sign(
      `I am signing my one-time nonce: ${user.nonce}`,
      user.publicAddress,
      '' // MetaMask will ignore the password argument here
    )
  } catch (err) {
    throw new Error(
      'Please sign the message to claim NEAR wallet.'
    )
  }

  // login with signature to get user details
  response = await fetch(`${FAUCET_URL}/auth`, {
    body: JSON.stringify({ publicAddress: window.ethUserAddress.toLowerCase(), signature }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  })
  if (!response.ok) {
    throw new Error('Failed to connect to faucet')
  }
  const { accessToken } = await response.json()
  window.localStorage.setItem('paras-faucet-access-token', accessToken)

  const { payload } = jwtDecode(accessToken)
  response = await fetch(`${FAUCET_URL}/users/${payload.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!response.ok) {
    throw new Error('Failed to connect to faucet')
  }
  const userDetails = await response.json()

  if (userDetails.claimed) {
    // User already claimed but might not have created the near account yet.
    // If this is the case, check local storage to continue where the user left off.
    const alreadyClaimedKey = window.localStorage.getItem(`claim_${userDetails.id}`)
    if (!alreadyClaimedKey) {
      throw new Error(
        `Did you already claim ${window.ethUserAddress} in a different browser? Could not find key in localStorage.`
      )
    }
  }
}

export async function getClaimURL () {
  const accessToken = window.localStorage.getItem('paras-faucet-access-token')
  const { payload } = jwtDecode(accessToken)
  const alreadyClaimedKey = window.localStorage.getItem(`claim_${payload.id}`)
  if (alreadyClaimedKey) {
    return `${CLAIM_URL}${alreadyClaimedKey}`
  }
  // Claim with the keypair generated locally
  const keypair = naj.utils.KeyPair.fromRandom('ed25519')
  const key = {
    publicKey: keypair.getPublicKey().toString(),
    secretKey: keypair.toString()
  }
  const claimedKey = key.secretKey.replace('ed25519:', '')
  // TODO: get invite id from url params (+ functionality to create invite link on bridge UI) ?
  const invite = 0
  const response = await fetch(`${FAUCET_URL}/claim/${payload.id}/${key.publicKey}/${invite}`, {
    body: '',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    method: 'PATCH'
  })
  if (!response.ok) {
    throw new Error('Failed to connect to faucet')
  }
  const claim = await response.json()
  if (!claim.status) {
    throw new Error(claim.text)
  }

  // Record the claimedKey locally in case the user doesn't complete the account creation.
  window.localStorage.setItem(`claim_${payload.id}`, claimedKey)
  return `${CLAIM_URL}${claimedKey}`
}
