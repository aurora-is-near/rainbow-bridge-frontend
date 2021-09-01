import autobahn from 'autobahn'
import {
  replaceTransfers,
  get as getTransfers,
  getReplacementTransfers
} from '@near-eth/client'
import { CUSTOM_ERC20_STORAGE } from './utils'

async function getWampSession () {
  return await new Promise((resolve, reject) => {
    const wamp = new autobahn.Connection({
      realm: 'near-explorer',
      transports: [
        {
          url: 'wss://near-explorer-wamp.onrender.com/ws',
          type: 'websocket'
        }
      ],
      authmethods: ['ticket'],
      authid: 'near-explorer-backend',
      onchallenge: (_session, method, _extra) => {
        console.log('challenge: ', method)
        if (method === 'ticket') {
          return process.env.WAMP_NEAR_EXPLORER_BACKEND_SECRET
        }
        throw new Error('WAMP authentication error: unsupported challenge method')
      },
      retry_if_unreachable: false
    })
    wamp.onopen = (session) => {
      console.log('open: ', session)
      resolve(session)
    }
    wamp.onclose = (reason) => {
      console.log('close: ', reason)
      reject(reason)
      return false
    }
    wamp.open()
  })
}

export default async function syncTransfers ({ ethAddress, nearAccountId }) {
  const session = await getWampSession()
  const featuredErc20s = JSON.parse(process.env.featuredErc20s)
  const customErc20s = JSON.parse(localStorage.getItem(CUSTOM_ERC20_STORAGE)) ?? []
  const tokens = [...featuredErc20s, ...customErc20s]
  let localTransfers = await getTransfers()

  // Find lock/burn/withdraw transaction hashes
  // ==========================================
  // [ [ ethLockTxs[], ethBurnTxs[]], [ nearLockTxs[], nearBurnTxs[] ], [ token0[], [ lockTxs[], burnTxs[] ] ]
  const [allEthTxs, allNearTxs, allTokenTxs] = await Promise.all([
    await Promise.all([
      await window.ethXnear.naturalETH.findAllTransactions({
        fromBlock: Number(process.env.ethAutoSyncFromBlock),
        toBlock: 'latest',
        sender: ethAddress ?? window.ethUserAddress
      }),
      await window.ethXnear.bridgedETH.findAllTransactions({
        fromBlock: process.env.nearAutoSyncFromBlock,
        toBlock: 'latest',
        sender: nearAccountId ?? window.nearUserAddress,
        callIndexer: async (query) => await session.call(`com.nearprotocol.${process.env.nearNetworkId}.explorer.select:INDEXER_BACKEND`, [query])
      })
    ]),
    await Promise.all([
      await window.ethXnear.naturalNEAR.findAllTransactions({
        fromBlock: process.env.nearAutoSyncFromBlock,
        toBlock: 'latest',
        sender: nearAccountId ?? window.nearUserAddress,
        callIndexer: async (query) => await session.call(`com.nearprotocol.${process.env.nearNetworkId}.explorer.select:INDEXER_BACKEND`, [query])
      }),
      await window.ethXnear.bridgedNEAR.findAllTransactions({
        fromBlock: Number(process.env.ethAutoSyncFromBlock),
        toBlock: 'latest',
        sender: ethAddress ?? window.ethUserAddress
      })
    ]),
    await Promise.all(tokens.map(async erc20Address => {
      return await Promise.all([
        await window.nep141Xerc20.naturalErc20.findAllTransactions({
          fromBlock: Number(process.env.ethAutoSyncFromBlock),
          toBlock: 'latest',
          sender: ethAddress ?? window.ethUserAddress,
          erc20Address
        }),
        await window.nep141Xerc20.bridgedNep141.findAllTransactions({
          fromBlock: process.env.nearAutoSyncFromBlock,
          toBlock: 'latest',
          sender: nearAccountId ?? window.nearUserAddress,
          erc20Address,
          callIndexer: async (query) => await session.call(`com.nearprotocol.${process.env.nearNetworkId}.explorer.select:INDEXER_BACKEND`, [query])
        })
      ])
    }))
  ])
  let [ethLockTxs, ethBurnTxs] = allEthTxs
  let [nearLockTxs, nearBurnTxs] = allNearTxs
  let bridgedErc20BurnTxs = []
  let erc20LockTxs = []
  allTokenTxs.forEach(([lockTxs, burnTxs]) => {
    erc20LockTxs = [...erc20LockTxs, ...lockTxs]
    bridgedErc20BurnTxs = [...bridgedErc20BurnTxs, ...burnTxs]
  })
  console.log('ethLockTxs: ', ethLockTxs)
  console.log('ethBurnTxs: ', ethBurnTxs)
  console.log('nearLockTxs: ', nearLockTxs)
  console.log('nearBurnTxs: ', nearBurnTxs)
  console.log('erc20LockTxs: ', erc20LockTxs)
  console.log('bridgedErc20BurnTxs: ', bridgedErc20BurnTxs)

  // Filter transaction hashes which should not be recovered
  // =======================================================
  const syncSteps = ['sync-bridged-nep141-to-erc20', 'sync-natural-near-to-e-near', 'sync-bridged-ether-to-natural-ether']
  localTransfers = localTransfers.filter((t) => {
    // Keep the transfer if already finalized or if the Ethereum tx is not yet mined
    if (
      t.status === 'completed' ||
      (!t.completedStep && t.type.includes('sendToNear')) ||
      (syncSteps.includes(t.completedStep) && t.type.includes('sendToEthereum') && t.status === 'in-progress')
    ) {
      // Find the lock/burn/withdraw tx hash to remove from findAllTransactions
      const startTransferHash = t.lockHashes ? last(t.lockHashes) : t.withdrawHashes ? last(t.withdrawHashes) : t.burnHashes ? last(t.burnHashes) : null
      // Filter lock/burn/withdraw hash so it is not recovered and keep the local transfer instead
      switch (t.type) {
        case '@near-eth/near-ether/bridged-near/sendToNear':
          nearBurnTxs = nearBurnTxs.filter(txHash => txHash !== startTransferHash)
          break
        case '@near-eth/near-ether/natural-near/sendToEthereum':
          nearLockTxs = nearLockTxs.filter(txHash => txHash !== startTransferHash)
          break
        case '@near-eth/near-ether/natural-ether/sendToNear':
          ethLockTxs = ethLockTxs.filter(txHash => txHash !== startTransferHash)
          break
        case '@near-eth/near-ether/bridged-ether/sendToEthereum':
          ethBurnTxs = ethBurnTxs.filter(txHash => txHash !== startTransferHash)
          break
        case '@near-eth/nep141-erc20/natural-erc20/sendToNear':
          erc20LockTxs = erc20LockTxs.filter(txHash => txHash !== startTransferHash)
          break
        case '@near-eth/nep141-erc20/bridged-nep141/sendToEthereum':
          bridgedErc20BurnTxs = bridgedErc20BurnTxs.filter(txHash => txHash !== startTransferHash)
          break
      }
      return true
    }
    return false
  })
  console.log('Transactions to query:')
  console.log('======================')
  console.log('ethLockTxs: ', ethLockTxs)
  console.log('ethBurnTxs: ', ethBurnTxs)
  console.log('nearLockTxs: ', nearLockTxs)
  console.log('nearBurnTxs: ', nearBurnTxs)
  console.log('erc20LockTxs: ', erc20LockTxs)
  console.log('bridgedErc20BurnTxs: ', bridgedErc20BurnTxs)

  // Recover transfer objects
  // ========================
  const ethTransfers = await Promise.all(ethLockTxs.map(async txHash => await window.ethXnear.naturalETH.recover(txHash)))
  const bridgedEthTransfers = (await Promise.all(
    ethBurnTxs.map(async txHash => {
      try {
        return await window.ethXnear.bridgedETH.recover(txHash)
      } catch (error) {
        // Unlike with Ethereum events, the transaction exists even if it failed.
        // So ignore the transfer if it cannot be recovered
        console.log('Failed to recover transfer (transaction failed ?): ', txHash, error)
        return null
      }
    })
  )).filter(transfer => transfer !== null)
  const nearTransfers = (await Promise.all(
    nearLockTxs.map(async txHash => {
      try {
        return await window.ethXnear.naturalNEAR.recover(txHash)
      } catch (error) {
        // Unlike with Ethereum events, the transaction exists even if it failed.
        // So ignore the transfer if it cannot be recovered
        console.log('Failed to recover transfer (transaction failed ?): ', txHash, error)
        return null
      }
    })
  )).filter(transfer => transfer !== null)
  const bridgedNearTransfers = await Promise.all(nearBurnTxs.map(async txHash => await window.ethXnear.bridgedNEAR.recover(txHash)))
  const erc20Transfers = await Promise.all(erc20LockTxs.map(async txHash => await window.nep141Xerc20.naturalErc20.recover(txHash)))
  const bridgedErc20Transfers = (await Promise.all(
    bridgedErc20BurnTxs.map(async txHash => {
      try {
        return await window.nep141Xerc20.bridgedNep141.recover(txHash)
      } catch (error) {
        // Unlike with Ethereum events, the transaction exists even if it failed.
        // So ignore the transfer if it cannot be recovered
        console.log('Failed to recover transfer (transaction failed ?): ', txHash, error)
        return null
      }
    })
  )).filter(transfer => transfer !== null)
  const syncTransfers = [
    ...localTransfers,
    ...ethTransfers, ...bridgedEthTransfers,
    ...nearTransfers, ...bridgedNearTransfers,
    ...erc20Transfers, ...bridgedErc20Transfers
  ]
  console.log('syncTransfers: ', syncTransfers)
  // Transfer will be updated at the next checkStatus
  replaceTransfers(syncTransfers)

  while (getReplacementTransfers().length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
  console.log('Auto sync completed')
}

const last = (arr) => arr[arr.length - 1]
