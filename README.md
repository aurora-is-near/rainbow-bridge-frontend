erc20-to-nep21
==================

Send an [ERC20] token over the [Rainbow Bridge], get an [NEP21] token on [NEAR]

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

4. Run [near-contract-helper](https://github.com/near/near-contract-helper) locally on the default port (3000)

5. Run [near-wallet](https://github.com/near/near-wallet) locally ([this PR](https://github.com/near/near-wallet/pull/861) streamlines it). Run it on port 4000 & set node's `--max-http-header-size` to `16000` (default is 8kb):

       yarn update:static; node --max-http-header-size=16000 ./node_modules/.bin/parcel -p 4000 src/index.html

6. Run the local development server: `yarn local` (see `package.json` for a full list of `scripts` you can run with `yarn`; see `.config.js` to see how environment variables are loaded in)
