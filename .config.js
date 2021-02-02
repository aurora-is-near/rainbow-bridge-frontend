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
    ethClientAddress: '0x05af81eeb82ab7a294a9942ba01ae2d2da9f18be',
    ethNearOnEthClientAbiText: readFileSync('./nearOnEthClient.abi'),
    ethEd25519Address: '0xe729ee84db978d7971bbc5079fd32bb0ae8d1856',
    ethErc20AbiText: readFileSync('./erc20.abi'),
    featuredErc20s:
      '0x722dd3F80BAC40c951b51BdD28Dd19d435762180,' + // TST: https://ropsten.etherscan.io/address/0x722dd3f80bac40c951b51bdd28dd19d435762180
      '0xfab46e002bbf0b4509813474841e0716e6730136,' + // FAU: https://ropsten.etherscan.io/token/0xfab46e002bbf0b4509813474841e0716e6730136
      '0xbf4d811e6891ed044d245cafcc4caa96c969204d',   // USDT: https://ropsten.etherscan.io/token/0xbf4d811e6891ed044d245cafcc4caa96c969204d
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0xa5289b6d5dcc13e48f2cc6382256e51589849f86',
    ethNetwork: 'ropsten',
    ethNodeUrl: 'https://rinkeby.infura.io/v3/TODO',
    ethProverAddress: '0xd67d3102fc06a0e7abb23ad0e5a9752d9397177e',
    ethProverAbiText: readFileSync('./prover.abi'),
    nearClientAccount: 'ethonnearclient10',
    nearHelperUrl: 'https://helper.testnet.near.org/',
    nearNetworkId: 'testnet',
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearProverAccount: 'ethonnearprover10',
    nearTokenFactoryAccount: 'f290121.ropsten.testnet',
    nearWalletUrl: 'https://wallet.testnet.near.org/',
  },
}
