🌈 Rainbow Bridge Frontend 🌈
=============================

An app that moves assets between Ethereum and NEAR. You can use this as the starting point for your own app on the [Rainbow Bridge].

Try it between [Ethereum Goerli] & [NEAR Testnet]: https://goerli.bridgetonear.org/

![Deploy](https://github.com/aurora-is-near/rainbow-bridge-frontend/actions/workflows/deploy.yaml/badge.svg)
![Lint](https://github.com/aurora-is-near/rainbow-bridge-frontend/actions/workflows/lint.yaml/badge.svg)


How it works
============

You can think of the [Rainbow Bridge] as having three main pieces:

1. Clients. These get raw NEAR data into Ethereum and vice versa. These are light clients that run as smart contracts in each blockchain, with external relays to pipe the data in each direction.
2. Provers. These are smart contracts that allow making assertions about data stored in the clients.
3. Connectors. These are smart contract pairs, one on each chain, that provide an interface to apps that want to send certain kinds of data or calls from one blockchain to the other. They use the provers to ensure each operation is valid.

An app such as this one can then make calls to these various contracts to move assets between Ethereum and NEAR.

Right now, this app only moves a specific [ERC20] fungible token from Ethereum to NEAR by making calls to a `TokenLocker` / `MintableFungibleToken` Connector contract pair. Here's how it looks:

![UI showing sending 10 RAIN tokens from Ethereum to NEAR. Two confirmations from MetaMask pop up at the beginning of the transaction, then a notification area shows waiting for 25 blocks to sync, then the tokens are deposited on the NEAR side and the NEAR balance increases by 10](demo.gif)

Above, we see someone sending tokens from their Ethereum wallet to their NEAR account. Here are the steps the app goes through:

1. Make a call to the ERC20 contract to grant escrow access to a TokenLocker contract for the specified number of tokens (MetaMask pops up a confirmation here)
2. Make a call to the TokenLocker to transfer these tokens from the user to itself (2nd MetaMask popup)
3. TokenLocker contract emits `Locked` event
4. This app waits for enough blocks to be mined on top of the one where this `Locked` event was emitted to feel confident that the transaction won't be reverted. This number could change based on the security needs of given Connector contracts.
5. In the GIF above, it waits 25 blocks. These blocks need not only be mined in Ethereum, but also need to land in the EthOnNear Client contract. In the code, you'll see the app check progress by making calls to such a Client contract.
6. This app makes a call to the `MintableFungibleToken` contract on NEAR to mint [NEP141] fungible tokens on NEAR. Since NEAR contracts charge the contract owner for [storage], this contract charges the user a small transaction fee, which is why you see a confirmation message on the NEAR side.
7. The tokens have appeared in the user's NEAR wallet, and the app updates accordingly.

Here's a schematic representation, where "Transfer script" is this app's JavaScript:

![TRANSFER SCRIPT calls 'approve' on ERC20 then 'lockToken' on LOCKER. LOCKER calls 'safeTransferFrom' on ERC20 then emits 'Locked' event. TRANSFER SCRIPT then notes the block of the 'Locked' event. TRANSFER SCRIPT then waits for this block to finalize over the bridge and extracts a proof. TRANSFER SCRIPT calls 'mint' on MINTABLE FUNGIBLE TOKEN. MINTABLE FUNGIBLE TOKEN checks that the event was not used before and that it's not too far in the past, then calls 'verify_log_entry' on PROVER. PROVER calls 'verify_trie_proof' on itself and then calls 'block_hash_safe' on ETH ON NEAR CLIENT. ETH ON NEAR CLIENT calls 'on_block_hash' on PROVER which calls 'finish_mint' on MINTABLE FUNGIBLE TOKEN](erc20-to-near.png)


Getting started
===============

0. Clone this repository
1. Make sure you've installed [Node.js] ≥ 12 and, optionally, [yarn]
2. Install dependencies: `npm install` (or `yarn install` if you prefer yarn)
3. Run the local development server: `npm run start` or `yarn start` (see
   `package.json` for a full list of `scripts` you can run)

This will start the app locally, connecting to smart contracts on the Ropsten test network for Ethereum and NEAR's Testnet. If you want to run _everything_ locally, see [below](#run-everything-locally).


Exploring the code
==================

1. Start in [package.json](./package.json)

   * Note the (relatively) short list of dependencies. If you prefer to use React, Vue, Svelte, Angular, or some other framework, this app should still be an easy starting point.
   * You'll see that the `start` script loads environment variables from the [.config.js](./.config.js) file. Anytime you see `process.env` in the code, you can check `.config.js` to see the value. This is also where you'll want to update settings to point at your own contracts.
   * After loading environment variables, the `start` script runs a development server using [Parcel](https://parceljs.org/), a zero-config bundler.

2. Next, explore [index.html](./src/index.html). Some interesting parts:

   * `global.css` – just as with JavaScript, this app is lightly opinionated about CSS. The global CSS file imports some more specific stylesheets [using Parcel](https://parceljs.org/css.html), but other than that strives to be [as minimal as possible](https://bits.theorem.co/css-pro-tips-responsive-font-sizes-and-when-to-use-which-units/). Feel free to swap out the approach for whatever CSS framework you prefer.
   * `data-behavior` attributes are the main way that JavaScript hooks in, except for some CSS+JS widget-type UI elements like `.dropdown`.
   * `aria-live="polite"`: this is for all the screen readers out there. It's how you make accessible dropdowns.
   * You'll see three main sections: 1. a `nav` element with the stuff that shows up in the top right, 2. the UI that shows up when you're signed out (note the `authEthereum` and `authNear` buttons), and 3. a `main` section, which is the UI you see when authenticated with both Ethereum and NEAR
   * Finally, at the bottom, you'll see the JS import

3. [index.js](./src/js/index.js): deceptively simple?

   * Note the imports of files named `authEthereum` & `authNear`. These imports have side effects, adding behavior to the buttons with matching `data-behavior` attributes. The Ethereum- and NEAR-specific stuff is mostly contained within these files, so you can compare the authentication & contract-initialization code side-by-side.
   * `initDOMHandlers` is a function that needs to be called once after page load, to add behavior like dropdown toggling & form submission. Check out [domHelpers.js](./src/js/domHelpers.js) to see the simple setup here.
   * `render` is a function which doesn't truly _render_, if you're used to thinking about rendering from a framework like React. Instead, this function procedurally updates the DOM based on current app state. Open [render.js](./src/js/render.js) to see everything it does. This function gets called again in both [authEthereum](./src/js/authEthereum.js) and [authNear](./src/js/authNear.js) after login.



Run everything locally (todo)
======================

In `package.json` you may have noticed a `local` command. This will let you run the app in "full local" mode, with a locally-running Ethereum network, NEAR network, NEAR Wallet (frontend & backend), Rainbow Bridge contracts, and an ERC20 contract.

This is difficult and error-prone, but could be streamlined if there's interest. Please [get in touch](https://near.chat/) if you want this.

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12

2. Install dependencies: `yarn install`

3. Follow the instructions for [rainbow-bridge-cli](https://github.com/near/rainbow-bridge-cli) to run an Ethereum network, a NEAR network, and the bridge all locally

4. Run [near-contract-helper](https://github.com/near/near-contract-helper) locally on the default port (3000)

5. Run [near-wallet](https://github.com/near/near-wallet) locally ([this PR](https://github.com/near/near-wallet/pull/861) streamlines it). Run it on port 4000 & set node's `--max-http-header-size` to `16000` (default is 8kb):

       yarn update:static; node --max-http-header-size=16000 ./node_modules/.bin/parcel -p 4000 src/index.html

6. Run the local development server: `yarn local` (see `package.json` for a full list of `scripts` you can run with `yarn`; see `.config.js` to see how environment variables are loaded in)


Contributing
============

You want to contribute to `rainbow-bridge-frontend` itself? Thank you!

To get started:

0. Fork & clone the repository
1. Make sure you've installed [Node.js] ≥ 12 and [yarn]
2. Install dependencies: `yarn install`
3. Make your changes, send a pull request!


Gotcha: commit messages
-----------------------

`rainbow-bridge-frontend` uses semantic versioning and auto-generates nice release notes & a changelog all based off of the commits. We do this by enforcing [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). In general the pattern looks like:

    type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")

Real world examples can look like this:

```
chore: run tests on travis ci
```

```
fix(server): send cors headers
```

```
feat(blog): add comment section
```

If your change should show up in release notes as a feature, use `feat:`. If it should show up as a fix, use `fix:`. Otherwise, you probably want `refactor:` or `chore:`. [More info](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)

  [ERC20]: https://eips.ethereum.org/EIPS/eip-20
  [Rainbow Bridge]: https://github.com/near/rainbow-bridge
  [NEP141]: https://github.com/near/NEPs/issues/141
  [NEAR]: https://near.org/
  [Ethereum Goerli]: https://goerli.etherscan.io
  [NEAR Testnet]: https://docs.near.org/docs/concepts/networks#testnet
  [storage]: https://docs.near.org/docs/concepts/storage-staking
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [yarn]: https://yarnpkg.com/



Release the repository
----------------------

Update the repository CHANGELOG:
```
yarn changelog
```

Commit and push master:
```
git commit -m "chore: Release v2.0.0."
git tag v2.0.0
```
