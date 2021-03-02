`@near-eth/client` – the Rainbow Bridge client library 🌈🌉
======================================================

Do you want to allow your users to send assets between [Ethereum] & [NEAR] over
the [Rainbow Bridge]?

Do you want to easily send assets between the two blockchains using your
command line?

Did you build a custom Rainbow Bridge [Connector] and now you want to figure
out how to build a client library for it, so other people can actually use it?

If you answered "Yes" to any of the above questions, this is the library for you!

  [Ethereum]: https://ethereum.org/
  [NEAR]: https://near.org/
  [Rainbow Bridge]: https://near.org/blog/eth-near-rainbow-bridge/
  [Connector]: https://github.com/near/rainbow-token-connector

Read on to find out how to:

- [Add it to your browser app](#add-it-to-your-browser-app)
- [Author a custom connector library](#author-a-custom-connector-library)
- [Contributing](#contributing)


Add it to your browser app
==========================

Let's say you want to allow users to send ERC20 tokens from Ethereum to NEAR,
where they'll become NEP141 tokens.

Step 0: Add Dependencies
------------------------

You'll need to add two dependencies to your app:

    npm install --save @near-eth/client @near-eth/nep141-erc20

Or, if using yarn:

    yarn add @near-eth/client @near-eth/nep141-erc20

### What is `@near-eth/nep141-erc20`?

The Rainbow Bridge between Ethereum and NEAR has [many pieces][Rainbow Bridge]. One piece is **Connector** contracts. The connector code for converting ERC20 tokens in Ethereum to NEP141 tokens in NEAR lives at [github.com/near/rainbow-token-connector][Connector].

The code for using a given connector from an app has its own library. The one for the connector above is [`@near-eth/nep141-erc20`].

Anyone can make connector contracts, and anyone can make client libraries for these contracts. If they follow the format of `@near-eth/nep141-erc20`, these client libraries will work automatically with the core Rainbow Bridge transfer library at `@near-eth/client`.

Generally, each connector client library, like `@near-eth/nep141-erc20`, will export four main interfaces, which can be used to:

1. Go from a "natural" Ethereum token to a "bridged" NEAR equivalent
2. Go from a "bridged" NEAR token, meaning a token that started its life in Ethereum but which now lives in NEAR, back to Ethereum
3. Go from a natural NEAR token to a bridged Ethereum equivalent
4. Go from a bridged Ethereum token back to NEAR

For `@near-eth/nep141-erc20`, these main exports are:

1. `naturalErc20` – example: go from DAI (a popular ERC20 token) to DAIⁿ
2. `bridgedNep141` – example: convert DAIⁿ back to DAI
3. `naturalNep141` – example: go from a natural NEAR token, such as BNNA Tokens in berryclub.io, to BNNAᵉ in Ethereum
4. `bridgedErc20` – example: convert BNNAᵉ back to BNNA

You can have multiple connector libraries in your app, some which may be maintained by NEAR and are in the `@near-eth` organization, and some which are not. An example `package.json` might end up looking something like:

```js
"dependencies": {
  "@near-eth/client": "*",
  "@near-eth/nep141-erc20": "*",
  "@near-eth/nep4-erc721": "*",
  "rainbow-bridge-erc20-with-rebase-and-nep21": "*",
}
```

(Note: `@near-eth/nep4-erc721` and `rainbow-bridge-erc20-with-rebase-and-nep21` do NOT currently exist, and are only shown to illustrate how this could work. As an aside, the current ERC20 connector does NOT support [tokens which use the `rebase` feature](https://etherscan.io/tokens/label/rebase-token) like [AMPL](https://etherscan.io/token/0xd46ba6d942050d489dbd938a2c909a5d5039a161) & [BASE](https://etherscan.io/token/0x07150e919b4de5fd6a63de1f9384828396f25fdc), which is why a hypothetical community-contributed "erc20-with-rebase" connector library is shown.)


Step 1: Authenticate user with both NEAR & Ethereum
---------------------------------------------------

A full transfer will make multiple calls to both the NEAR & Ethereum blockchains, and you'll need to make sure the user has an account/wallet on both chains.

### NEAR Authentication

#### `setNearConnection`

Your app needs to call `setNearConnection` and pass it a `WalletConnection` instance from `near-api-js`. Example:

```js
import { keyStores, Near, WalletConnection } from 'near-api-js'
import { setNearConnection } from '@near-eth/client'

window.nearConnection = new WalletConnection(
  new Near({
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    networkId: process.env.nearNetworkId,
    nodeUrl: process.env.nearNodeUrl,
    helperUrl: process.env.nearHelperUrl,
    walletUrl: process.env.nearWalletUrl
  })
)

setNearConnection(window.nearConnection)
```

If you don't know what to put for the settings passed to `new Near`, you can import the sensible defaults used by `@near-eth/client`:

```js
import { Near, WalletConnection } from 'near-api-js'
import { config, setNearConnection } from '@near-eth/client'

window.nearConnection = new WalletConnection(
  new Near(config.ropsten.near)
)

setNearConnection(window.nearConnection)
```

Learn [more about `config` from `@near-eth/client`](#TODO)


#### `requestSignIn()`

Additionally, you'll probably want to verify that a user has a NEAR account before they get started. Given a "Sign in with NEAR" button:

```html
<button id="authNear">Sign in with NEAR</button>
```

You can add this handler:

```js
// For this library's functionality, the specific contract address passed to
// `requestSignIn` is not super important, but you may want to use a contract
// from a connector library rather than the core client library
import { config } from '@near-eth/nep141-erc20'

document.querySelector('#authNear').onclick = () => {
  window.nearConnection.requestSignIn(config.ropsten.bridgeTokenFactory)
}
```

Learn [more about `config` from `@near-eth/nep141-erc20`](#TODO)

### Ethereum Authentication

Your app needs to call `setEthProvider`. Given a "Connect to Ethereum" button:

```html
<button id="authEthereum">Connect to Ethereum</button>
```

You can use [web3modal](https://github.com/web3modal/web3modal) to add this handler:

```js
import Web3Modal from 'web3modal'
import { setEthProvider } from '@near-eth/client'

const web3Modal = new Web3Modal({ cacheProvider: true })

async function loadWeb3Modal () {
  window.ethProvider = await web3Modal.connect()
  setEthProvider(window.ethProvider)
}

document.querySelector('#authEthereum').onclick = loadWeb3Modal

// on page load, check if user has already connected
if (web3Modal.cachedProvider) loadWeb3Modal()
```


Step 2: Initiate a transfer
---------------------------

Great, now your user is authenticated with both NEAR & Ethereum. Now let's say you have a form.

```html
<form id="sendErc20ToNear>
  <input id="erc20Address" />
  <input id="amount" />
</form>
```

Here's some JavaScript to make this work:

```js
import { naturalErc20 } from '@near-eth/nep141-erc20'

document.querySelector('#sendErc20ToNear').onsubmit = async e => {
  e.preventDefault()

  const [sender] = await window.ethProvider.request({method: 'eth_requestAccounts'})

  const recipient = window.nearConnection.getAccountId()

  const { erc20Address, amount } = e.target.elements

  naturalErc20.sendToNear({
    sender,
    recipient,
    erc20Address: erc20Address.value,
    amount: amount.value
  })
}
```


Step 3: List in-progress transfers
----------------------------------

For the rest of the lifetime of the transfer you just initiated, you will use
exports from `@near-eth/client`, rather than the connector-specific library.

Let's say you want to list in-progress transfers in this `ol`:

```html
<ol id="transfers-go-here"></ol>
```

Here's code to render the list of transfers:

```js
import { get, onChange } from '@near-eth/client'

function renderTransfers () {
  const transfers = get({ filter: { status: 'in-progress' } })
  document.querySelector('#transfers-go-here').innerHTML =
    transfers.map(renderTransfer).join('')
}

onChange(renderTransfers)

renderTransfers()
```

If using React, you'd want something like:

```jsx
TODO
```

And here's what `renderTransfer` might look like, using vanilla JS (translation
to React is straightforward):

```js
import { act, decorate } from '@near-eth/client'

function renderTransfer (transfer) {
  // "decorate" transfer with realtime info & other data that would bloat localStorage
  transfer = decorate(transfer, { locale: 'en_US' })
  return `
    <li class="transfer" id="${transfer.id}">
      ${transfer.amount}
      ${transfer.sourceTokenName} from
      ${transfer.sender} to
      ${transfer.recipient}
      ${!transfer.callToAction ? '' : `
        <button class="act-on-transfer">
          ${transfer.callToAction}
        </button>
      `}
    </li>
  `
})

// Vanilla JS shenanigans: add a click handler to `body`, because transfers are
// rendered with JS and therefore unavailable for adding click handlers at
// initial page load.
// This will be easier if you use React or something 😄
document.querySelector('body').addEventListener('click', event => {
  const callToAction = event.target.closest('.act-on-transfer')
  if (callToAction) {
    const transferId = callToAction.closest('.transfer').id
    act(transferId)
  }
})
```

Here's some [docs about act][act], and [two][act2] [example][act3]
connector-specific behaviors. Here's some [docs about decorate][decorate], and
[two][decorate2] [example][decorate3] connector-specific behaviors. Here's the
attributes for [two][initiate-natural] [kinds][initiate-bridged] of raw
transfers, prior to being decorated.

  [act]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/index.js#L132-L140
  [act2]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/natural-erc20-to-nep141/index.js#L62-L69
  [act3]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/bridged-nep141-to-erc20/index.js#L67-L73
  [decorate]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/index.js#L46-L68
  [decorate2]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/natural-erc20-to-nep141/index.js#L19-L59
  [decorate3]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/bridged-nep141-to-erc20/index.js#L141-L64
  [initiate-natural]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/natural-erc20-to-nep141/index.js#L97-L117
  [initiate-bridged]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/transfers/erc20%2Bnep141/bridged-nep141-to-erc20/index.js#L98-L1141


Step 4: check & update status of in-progress transfers
------------------------------------------------------

Your app will need to prompt users to sign in with both Ethereum
([example][authEthereum]) and NEAR ([example][authNear]). After the
authorization process completes for both chains, you need this:

```js
import { checkStatusAll } from '@near-eth/client'

checkStatusAll({ loop: 15000 })
```

What's it do?

This library is designed to be non-blocking, which means a user can start
multiple transfers at once, and the library won't pause to wait for blocks to
be mined in Ethereum, finalized in NEAR, or synced between the two.

This means that with only the code from Steps 1-3, nothing else will happen. A
user will have sent an initial transaction to the Ethereum or NEAR blockchain,
but neither your app nor any other service will ever check to see if that
transaction completes successfully. Nor will any app or service prompt the user
to complete the next transaction in the process (any transfer requires multiple
steps & multiple on-chain transactions to complete).

`checkStatusAll` will loop as frequently as you tell it to. It will check to
see if transactions have been mined, synced, or finalized, and update transfers
in localStorage accordingly. When transfers are updated, the `onChange`
function in Step 3 will trigger a UI update.

  [authEthereum]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/authEthereum.js
  [authNear]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/js/authNear.js


Step 5: there is no step 5!
---------------------------

That's it! You successfully integrated cross-chain transfers into your app in
just four steps. 🌈🌉🎉

To make it more beautiful, check out [the API docs](#TODO🙃) and [example
code][example] (implemented in vanilla/no-framework JavaScript).

  [example]: https://github.com/near/rainbow-bridge-frontend/blob/bfcd96178316f8408451417371bebd253cc64abd1/src/html/transfers.html#L339-L388


Author a custom connector library
=================================

1. Copy the code in the [`@near-eth/nep141-erc20`] library
2. Adjust for your needs

  [`@near-eth/nep141-erc20`]: https://github.com/near/rainbow-bridge-frontend/tree/526ed49248974e38b438d92c12ede1b6305eb869/src/js/transfers/erc20%2Bnep141
