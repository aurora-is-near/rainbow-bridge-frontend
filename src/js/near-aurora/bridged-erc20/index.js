import { ethers } from 'ethers'
import { getAuroraProvider, track } from '@near-eth/client'

export const SOURCE_NETWORK = 'aurora'
export const DESTINATION_NETWORK = 'near'

export const i18n = {
  en_US: {
    steps: transfer => [],
    statusMessage: transfer => {
      switch (transfer.status) {
        case 'in-progress': return 'Confirming transaction'
        case 'failed': return 'Failed: check transaction status from Wallet'
        default: return 'Completed'
      }
    },
    callToAction: transfer => { return 'NONE' }
  }
}

export async function checkStatus (transfer) {
  const provider = getAuroraProvider()
  const receipt = await provider.getTransactionReceipt(transfer.hash)
  if (!receipt) return transfer
  if (!receipt.status || receipt.status !== 1) {
    return { ...transfer, status: 'failed', receipt, errors: ['Execution failed'] }
  }
  return { ...transfer, status: 'completed', receipt }
}

export async function withdrawToNear (erc20Address, amount, decimals, name) {
  const contractAbiFragment = [
    'function withdrawToNear(bytes memory recipient, uint256 amount) external'
  ]
  const erc20Contract = new ethers.Contract(
    erc20Address,
    contractAbiFragment,
    window.web3Provider.getSigner()
  )
  const tx = await erc20Contract.withdrawToNear(
    Buffer.from(window.nearUserAddress),
    amount,
    { gasLimit: 100000 }
  )
  const transfer = {
    status: 'in-progress',
    type: 'aurora<>near/sendToNear',
    amount: amount,
    decimals,
    sourceTokenName: name,
    completedStep: null,
    sender: window.ethUserAddress,
    recipient: window.nearUserAddress,
    errors: [],
    hash: tx.hash
  }
  await track(transfer)
  return tx
}

export async function withdrawAndUnwrapNear (amount) {
}
