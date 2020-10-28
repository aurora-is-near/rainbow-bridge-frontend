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
    ethClientAddress: '0xF721c979db97413AA9D0F91ad531FaBF769bb09C',
    ethEd25519Address: '0x9003342d15B21b4C42e1702447fE2f39FfAF55C2',
    ethErc20AbiText: readFileSync('./erc20.abi'),
    featuredErc20s:
      '0x3e13318e92F0C67Ca10f0120372E998d43E6a8E8,' + // ABND
      '0xD959Dc6e63B9521A042A1b30003b00D0356a1cd5,' + // ABND clone
      '0x09ff402D55096bFB134DD4a34A42579b7925becC,' + // ABND clone
      '0x8151a8F90267bFf183E06921841C5dE774499388,' + // rainbow-bridge-cli v1
      '0x21e7381368baa3f3e9640fe19780c4271ad96f37',   // rainbow-bridge-cli v2
    ethLockerAbiText: readFileSync('./node_modules/rainbow-token-connector/res/BridgeTokenFactory.full.abi'),
    ethLockerAddress: '0x7f66c116a4f51e43e7c1c33d3714a4acfa9c40fb',
    ethNetwork: 'rinkeby',
    ethNodeUrl: 'https://rinkeby.infura.io/v3/TODO',
    ethProverAddress: '0xc5D62d66B8650E6242D9936c7e50E959BA0F9E37',
    nearClientAccount: 'ethonnearclient10',
    nearHelperUrl: 'https://helper.testnet.near.org/',
    nearNetworkId: 'testnet',
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearProverAccount: 'ethonnearprover10',
    nearTokenFactoryAccount: 'ntf4.bridge2.testnet',
    nearWalletUrl: 'https://wallet.testnet.near.org/',
  },
}
