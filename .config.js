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
    ethErc20AbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/MyERC20.full.abi'),
    ethLockerAbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/TokenLocker.full.abi'),
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearFunTokenAccount: 'nearfuntoken',
    nearWalletUrl: 'http://localhost:4000/',
    nearHelperUrl: 'http://localhost:3000/'
  },
  development: {
    ethErc20Address: '???',
    ethErc20AbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/MyERC20.full.abi'),
    ethNodeUrl: '???',
    ethLockerAddress: '',
    ethLockerAbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/TokenLocker.full.abi'),
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearNetworkId: 'testnet',
    nearFunTokenAccount: '???',
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearWalletUrl: 'https://wallet.testnet.near.org/',
    nearHelperUrl: 'https://helper.testnet.near.org/'
  },
}
