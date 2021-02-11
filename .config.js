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
    ethErc20AbiText: readFileSync('./erc20.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/ERC20Locker.full.abi'),
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearWalletUrl: 'http://localhost:4000/',
    nearHelperUrl: 'http://localhost:3000/'
  },
  development: {
    // library settings
    ethClientAddress: '0x05af81eeb82ab7a294a9942ba01ae2d2da9f18be',
    ethNearOnEthClientAbiText: readFileSync('./nearOnEthClient.abi'),
    ethEd25519Address: '0xe729ee84db978d7971bbc5079fd32bb0ae8d1856',
    ethErc20AbiText: readFileSync('./erc20.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0xa5289b6d5dcc13e48f2cc6382256e51589849f86',
    ethProverAddress: '0xd67d3102fc06a0e7abb23ad0e5a9752d9397177e',
    ethProverAbiText: readFileSync('./prover.abi'),
    nearClientAccount: 'client.ropsten.testnet',
    nearHelperUrl: 'https://helper.testnet.near.org',
    nearProverAccount: 'prover.ropsten.testnet',
    nearTokenFactoryAccount: 'f290121.ropsten.testnet',

    // frontend settings
    featuredErc20s: JSON.stringify({
      main: [
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI: https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f
      ],
      ropsten: [
        '0x722dd3F80BAC40c951b51BdD28Dd19d435762180', // TST: https://ropsten.etherscan.io/address/0x722dd3f80bac40c951b51bdd28dd19d435762180
        '0xFab46E002BbF0b4509813474841E0716E6730136', // FAU: https://ropsten.etherscan.io/token/0xfab46e002bbf0b4509813474841e0716e6730136
        '0xbF4D811e6891eD044D245cafcC4CAa96c969204D', // USDT: https://ropsten.etherscan.io/token/0xbf4d811e6891ed044d245cafcc4caa96c969204d
      ],
      rinkeby: [
        '0x3e13318e92F0C67Ca10f0120372E998d43E6a8E8', // ABND: https://github.com/chadoh/abundance-token
      ],
    }),
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearWalletUrl: 'https://wallet.testnet.near.org',
    nearExplorerUrl: 'https://explorer.testnet.near.org',
    nearNetworkId: 'testnet',
  },
}
