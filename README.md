erc20-to-nep21
==================

Send an [ERC20] token over the [Rainbow Bridge], get an [NEP21] token on [NEAR]

![UI showing sending 10 RAIN tokens from Ethereum to NEAR. Two confirmations from MetaMask pop up at the beginning of the transaction, then a notification area shows waiting for 25 blocks to sync, then the tokens are deposited on the NEAR side and the NEAR balance increases by 10](demo.gif)

  [ERC20]: https://eips.ethereum.org/EIPS/eip-20
  [Rainbow Bridge]: https://github.com/near/rainbow-bridge
  [NEP21]: https://github.com/nearprotocol/NEPs/pull/21
  [NEAR]: https://near.org/


Run Everything Locally
===========

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js](https://nodejs.org/en/download/package-manager/) ≥ 12

2. Install dependencies: `yarn install`

3. Follow the instructions for [rainbow-bridge-cli](https://github.com/near/rainbow-bridge-cli) to run an Ethereum network, a NEAR network, and the bridge all locally

4. Clone [rainbow-bridge-rs](https://github.com/near/rainbow-bridge-rs) and checkout [this branch](https://github.com/near/rainbow-bridge-rs/pull/8), and deploy it to your locally-running NEAR network. You will need to copy the private key for `nearfuntoken` from `~/.rainbow/config.json` to `~/.near-credentials/localnet/nearfuntoken.json`, then you can deploy it with:

      NEAR_ENV=local near deploy -v --contractName nearfuntoken --wasmFile res/mintable_fungible_token.wasm --keyPath ~/.near-credentials/localnet/nearfuntoken.json

5. Run [near-contract-helper](https://github.com/near/near-contract-helper) locally on the default port (3000)

6. Run [near-wallet](https://github.com/near/near-wallet) locally ([this PR](https://github.com/near/near-wallet/pull/861) streamlines it). Run it on port 4000 & set node's `--max-http-header-size` to `16000` (default is 8kb):

       yarn update:static; node --max-http-header-size=16000 ./node_modules/.bin/parcel -p 4000 src/index.html

7. Run the local development server: `yarn local` (see `package.json` for a full list of `scripts` you can run with `yarn`; see `.config.js` to see how environment variables are loaded in)
