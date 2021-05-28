// Run everything locally!
//
//   * NEAR & Ethereum networks & bridge: https://github.com/near/rainbow-bridge-cli
//   * NEAR "contract helper": https://github.com/near/near-contract-helper
//   * NEAR Wallet: https://github.com/near/near-wallet
//
// Then use `yarn local` to use config created by rainbow-bridge-cli
const homedir = require('os').homedir()
const path = require('path')
const { readFileSync } = require('fs')
let localConfig
try {
  localConfig = require(path.join(homedir, '.rainbow', 'config.json'))
} catch (e) {
  localConfig = {}
}

module.exports = {
  local: {
    ...localConfig,
    ethNetwork: 'localhost:9545',
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./abi/ERC20Locker.full.abi'),
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearWalletUrl: 'http://localhost:4000/',
    nearHelperUrl: 'http://localhost:3000/'
  },
  ropsten_development: {
    // library settings
    ethClientAddress: '0xb289c6e6c98644dc9f6a03c044564bc8558b6087',
    ethNearOnEthClientAbiText: readFileSync('./abi/nearOnEthClient.abi'),
    ethEd25519Address: '0xe729ee84db978d7971bbc5079fd32bb0ae8d1856',
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./abi/ERC20Locker.full.abi'),
    ethLockerAddress: '0xb48e6441524f261e141bc766a7ebd54b19ca7465',
    ethProverAddress: '0xb3df48b0ea3e91b43226fb3c5eb335b7e3d76faa',
    ethProverAbiText: readFileSync('./abi/prover.abi'),
    nearClientAccount: '0.client.ropsten.testnet',
    nearHelperUrl: 'https://helper.testnet.near.org',
    nearProverAccount: 'prover.ropsten.testnet',
    nearTokenFactoryAccount: 'f.ropsten.testnet',

    // frontend settings
    featuredErc20s: JSON.stringify([
      '0xfab46e002bbf0b4509813474841e0716e6730136', // FAU: https://ropsten.etherscan.io/token/0xfab46e002bbf0b4509813474841e0716e6730136
      '0x722dd3f80bac40c951b51bdd28dd19d435762180', // TST: https://ropsten.etherscan.io/address/0x722dd3f80bac40c951b51bdd28dd19d435762180
      '0xbf4d811e6891ed044d245cafcc4caa96c969204d', // USDT: https://ropsten.etherscan.io/token/0xbf4d811e6891ed044d245cafcc4caa96c969204d
    ]),
    nearNodeUrl: 'https://archival-rpc.testnet.near.org/',
    nearWalletUrl: 'https://wallet.testnet.near.org',
    nearExplorerUrl: 'https://explorer.testnet.near.org',
    nearNetworkId: 'testnet',
    ethNetworkId: 'ropsten',

    eNEARAbiText: readFileSync('./abi/eNEAR.abi'),
    eNEARAddress: '0x2b3077b25909f24de5543d1e350c4d60f9e0c3ed',
    nativeNEARLockerAddress: '0.e-near.testnet',
  },
  mainnet: {
    // library settings
    ethClientAddress: '0x0151568af92125fb289f1dd81d9d8f7484efc362',
    ethNearOnEthClientAbiText: readFileSync('./abi/nearOnEthClient.abi'),
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./abi/ERC20Locker.full.abi'),
    ethLockerAddress: '0x23ddd3e3692d1861ed57ede224608875809e127f',
    nearClientAccount: 'client.bridge.near',
    nearHelperUrl: 'https://helper.near.org',
    nearTokenFactoryAccount: 'factory.bridge.near',

    // frontend settings
    featuredErc20s: JSON.stringify([
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', //   AAVE
      '0x4fabb145d64652a948d72533023f6e7a623c7c53', //   BUSD
      '0xc00e94cb662c3520282e6f5717214004a7f26888', //   COMP
      '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', //   CRO
      '0x6b175474e89094c44da98b954eedeac495271d0f', //   DAI
      '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9', //   FTT
      '0xc944e90c64b2c07662a292be6244bdf05cda44a7', //   GRT
      '0x0316eb71485b0ab14103307bf65a021042c6d380', //   HBTC
      '0x6f259637dcd74c767781e37bc6133cd6a68aa161', //   HT
      '0x514910771af9ca656af840dff83e8264ecf986ca', //   LINK
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', //   MKR
      '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //   SNX
      '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', //   SUSHI
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', //   UNI
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //   USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7', //   USDT
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //   WBTC
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //   WETH
      '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', //   YFI
      '0x111111111117dc0aa78b770fa6a738034120c302', //   1INCH
    ]),
    nearNodeUrl: 'https://archival-rpc.mainnet.near.org/',
    nearWalletUrl: 'https://wallet.near.org',
    nearExplorerUrl: 'https://explorer.near.org',
    nearNetworkId: 'mainnet',
    ethNetworkId: 'main',

    eNEARAbiText: readFileSync('./abi/eNEAR.abi'),
    eNEARAddress: '0x85f17cf997934a597031b2e18a9ab6ebd4b9f6a4',
    nativeNEARLockerAddress: 'e-near.near',

  }
}
