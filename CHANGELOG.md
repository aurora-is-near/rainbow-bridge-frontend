# [1.2.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.1.0...v1.2.0) (2020-10-16)


### Features

* simplify borsh handling ([61d3c61](https://github.com/near/rainbow-bridge-frontend/commit/61d3c613ee90d163efde217165fc295c4908307b))

# [1.1.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.0.0...v1.1.0) (2020-10-08)


### Features

* rm mint_with_json, use borsh serialization ([7b311f6](https://github.com/near/rainbow-bridge-frontend/commit/7b311f64b3d93730efe17ec7b3c07b83034fae85))

# 1.0.0 (2020-09-17)

It works! 

This version of the app can successfully send [Abundance Tokens (ABND)](http://chadoh.com/abundance-token/) (a test token you can mint to yourself) from [Rinkeby](https://support.airswap.io/en/articles/2831385-what-is-rinkeby) to [NEAR Testnet](https://docs.near.org/docs/roles/developer/networks#testnet)

With legible, framework-free (aka "vanilla JS") code, you can feel confident using this as a starting point for your own "Dapps on the bridge"

What's missing?

* You cannot send the wrapped Abundance Tokens (`nABND`) back to Ethereum
* You cannot send a different ERC20 without deploying your own "Connector" contracts. Soon there will be a [generic connector](https://github.com/near/rainbow-token-connector) that will allow sending any ERC20 across the bridge. It will also let you send native NEAR fungible tokens (the [NEP21](https://github.com/nearprotocol/NEPs/blob/master/specs/Standards/Tokens/FungibleToken.md) standard) to Ethereum and back again.
* The code in `transfers.js` needs to be extracted to a library

In addition, some details about how the Rainbow Bridge currently works are under active development. This app will be updated to reflect these changes, with semantic versioning used to indicate the severity of the change.
