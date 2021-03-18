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
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/ERC20Locker.full.abi'),
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearWalletUrl: 'http://localhost:4000/',
    nearHelperUrl: 'http://localhost:3000/'
  },
  ropsten_development: {
    // library settings
    ethClientAddress: '0x4018820687bfbf222fabd2ee014f6dc325c64084',
    ethNearOnEthClientAbiText: readFileSync('./abi/nearOnEthClient.abi'),
    ethEd25519Address: '0xe729ee84db978d7971bbc5079fd32bb0ae8d1856',
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0xb48e6441524f261e141bc766a7ebd54b19ca7465',
    ethProverAddress: '0xb3df48b0ea3e91b43226fb3c5eb335b7e3d76faa',
    ethProverAbiText: readFileSync('./abi/prover.abi'),
    nearClientAccount: 'client.ropsten.testnet',
    nearHelperUrl: 'https://helper.testnet.near.org',
    nearProverAccount: 'prover.ropsten.testnet',
    nearTokenFactoryAccount: 'f.ropsten.testnet',

    // frontend settings
    featuredErc20s: JSON.stringify([
      '0x722dd3F80BAC40c951b51BdD28Dd19d435762180', // TST: https://ropsten.etherscan.io/address/0x722dd3f80bac40c951b51bdd28dd19d435762180
      '0xFab46E002BbF0b4509813474841E0716E6730136', // FAU: https://ropsten.etherscan.io/token/0xfab46e002bbf0b4509813474841e0716e6730136
      '0xbF4D811e6891eD044D245cafcC4CAa96c969204D', // USDT: https://ropsten.etherscan.io/token/0xbf4d811e6891ed044d245cafcc4caa96c969204d
    ]),
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearWalletUrl: 'https://wallet.testnet.near.org',
    nearExplorerUrl: 'https://explorer.testnet.near.org',
    nearNetworkId: 'testnet',
    ethNetworkId: 'ropsten',
  },
  rinkeby_development: {
    // library settings
    ethClientAddress: '0x067421d6ba15d5c70190a1e512c5f9137a4a8168',
    ethNearOnEthClientAbiText: readFileSync('./abi/nearOnEthClient.abi'),
    ethEd25519Address: '0xa9e58bed3649e535dba9fa594e67e39575db3f4b',
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0x6381a3bad6b51988497dc588496ad1177d1650ea',
    ethProverAddress: '0x57d7dc68f98bd09b8d1ea46aac61c305f203f104',
    ethProverAbiText: readFileSync('./abi/prover.abi'),
    nearClientAccount: 'client.rinkeby.testnet',
    nearHelperUrl: 'https://helper.testnet.near.org',
    nearProverAccount: 'prover.rinkeby.testnet',
    nearTokenFactoryAccount: 'f030221.rinkeby.testnet',

    // frontend settings
    featuredErc20s: JSON.stringify([
      '0x3e13318e92F0C67Ca10f0120372E998d43E6a8E8', // ABND: https://github.com/chadoh/abundance-token
    ]),
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearWalletUrl: 'https://wallet.testnet.near.org',
    nearExplorerUrl: 'https://explorer.testnet.near.org',
    nearNetworkId: 'testnet',
    ethNetworkId: 'rinkeby',
  },
  mainnet: {
    // library settings
    ethClientAddress: '0xce9d8c70c2ac161383c4debf207d884f6531b1b9',
    ethNearOnEthClientAbiText: readFileSync('./abi/nearOnEthClient.abi'),
    ethErc20AbiText: readFileSync('./abi/erc20.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0x23ddd3e3692d1861ed57ede224608875809e127f',
    nearClientAccount: 'client.bridge.near',
    nearHelperUrl: 'https://helper.near.org',
    nearTokenFactoryAccount: 'factory.bridge.near',

    // frontend settings
    featuredErc20s: JSON.stringify([
      '0xdac17f958d2ee523a2206206994597c13d831ec7', //   USDT
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', //   UNI
      '0x514910771af9ca656af840dff83e8264ecf986ca', //   LINK
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //   USDC
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //   WBTC
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', //   AAVE
      '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', //   CRO
      '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9', //   FTT
      '0x4fabb145d64652a948d72533023f6e7a623c7c53', //   BUSD
      '0x6f259637dcd74c767781e37bc6133cd6a68aa161', //   HT
      '0x6b175474e89094c44da98b954eedeac495271d0f', //   DAI
      '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', //   SUSHI
      '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //   SNX
      '0xc944e90c64b2c07662a292be6244bdf05cda44a7', //   GRT
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', //   MKR
      '0xc00e94cb662c3520282e6f5717214004a7f26888', //   COMP
      '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e', //   YFI
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //   WETH
      '0x0316eb71485b0ab14103307bf65a021042c6d380', //   HBTC
    ]),
    nearNodeUrl: 'https://rpc.mainnet.near.org',
    nearWalletUrl: 'https://wallet.near.org',
    nearExplorerUrl: 'https://explorer.near.org',
    nearNetworkId: 'mainnet',
    ethNetworkId: 'main',

  }
}
