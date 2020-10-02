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
    ethLockerAbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/TokenLocker.full.abi'),
    nearClientAccount: 'rainbow_bridge_eth_on_near_client',
    nearFunTokenAccount: 'nearfuntoken',
    nearWalletUrl: 'http://localhost:4000/',
    nearHelperUrl: 'http://localhost:3000/'
  },
  development: {
    ethClientAddress: '0xF721c979db97413AA9D0F91ad531FaBF769bb09C',
    ethEd25519Address: '0x9003342d15B21b4C42e1702447fE2f39FfAF55C2',
    ethErc20AbiText: readFileSync('./erc20.abi'),
    ethErc20Address: '0x8151a8F90267bFf183E06921841C5dE774499388',
    ethLockerAbiText: readFileSync('./node_modules/rainbow-bridge-sol/token-locker/dist/TokenLocker.full.abi'),
    ethLockerAddress: '0x5f7Cc23F90b5264a083dcB3b171c7111Dc32dD00',
    ethNetwork: 'rinkeby',
    ethNodeUrl: 'https://rinkeby.infura.io/v3/TODO',
    ethProverAddress: '0xc5D62d66B8650E6242D9936c7e50E959BA0F9E37',
    nearClientAccount: 'ethonnearclient10',
    nearFunTokenAccount: 'mintablefuntoken11',
    nearHelperUrl: 'https://helper.testnet.near.org/',
    nearNetworkId: 'testnet',
    nearNodeUrl: 'https://rpc.testnet.near.org',
    nearProverAccount: 'ethonnearprover10',
    nearWalletUrl: 'https://wallet.testnet.near.org/',
  },
}
