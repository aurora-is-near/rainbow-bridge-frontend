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
  }
}
