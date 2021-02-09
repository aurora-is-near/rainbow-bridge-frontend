## [1.9.2](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.1...v1.9.2) (2021-02-09)


### Bug Fixes

* beautify "bridge NEP21 back to Eth" dropdown ([5de9c22](https://github.com/near/rainbow-bridge-frontend/commit/5de9c22f6c93519444673a58634a3394c8a0bdf8))

## [1.9.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.0...v1.9.1) (2021-02-08)


### Bug Fixes

* show unknown token icon on non-root url ([29b28bb](https://github.com/near/rainbow-bridge-frontend/commit/29b28bbf6e0405e79ea3504d8a8f5ff033b8e36b))

# [1.9.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.8.4...v1.9.0) (2021-02-04)


### Features

* document transfers-library-to-be ([2406e83](https://github.com/near/rainbow-bridge-frontend/commit/2406e832274ae38d4735702d865c4ad764823152))

## [1.8.4](https://github.com/near/rainbow-bridge-frontend/compare/v1.8.3...v1.8.4) (2021-02-04)


### Bug Fixes

* transfers actually complete sometimes now ([b679d98](https://github.com/near/rainbow-bridge-frontend/commit/b679d98666ad0fbaed9a1f00de9b95ccfb6027c8))

## [1.8.3](https://github.com/near/rainbow-bridge-frontend/compare/v1.8.2...v1.8.3) (2021-02-03)


### Bug Fixes

* simplify authenticated-accounts renderer ([dee3124](https://github.com/near/rainbow-bridge-frontend/commit/dee3124c477f83a5d70d927be9e6a0d9a07121cf))

## [1.8.2](https://github.com/near/rainbow-bridge-frontend/compare/v1.8.1...v1.8.2) (2021-02-03)


### Bug Fixes

* update client & prover addresses ([d50d23c](https://github.com/near/rainbow-bridge-frontend/commit/d50d23caa0e14313e5140f1d30a779f0097472b3))

## [1.8.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.8.0...v1.8.1) (2021-02-02)


### Bug Fixes

* actually allow sending erc20 across ([6f08d5e](https://github.com/near/rainbow-bridge-frontend/commit/6f08d5e0852a5bcfd9ff9aa6de17b8c92499d24b))

# [1.8.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.7.2...v1.8.0) (2021-02-02)


### Features

* select erc20 with modal ([e159973](https://github.com/near/rainbow-bridge-frontend/commit/e159973b2c804eb39bf0a3ea45dbeace38aa74b2))

## [1.7.2](https://github.com/near/rainbow-bridge-frontend/compare/v1.7.1...v1.7.2) (2021-01-27)


### Bug Fixes

* add cancel buttons ([f8b1706](https://github.com/near/rainbow-bridge-frontend/commit/f8b1706708fcb0c002430c1624ca11e64835c453))

## [1.7.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.7.0...v1.7.1) (2021-01-27)


### Bug Fixes

* **styles:** re-affix buttons to small screen bottoms ([5cecb5a](https://github.com/near/rainbow-bridge-frontend/commit/5cecb5a156c101213de2b993ca617d615b2e1f99))
* don't show New Transfer form if not authed ([04a9a46](https://github.com/near/rainbow-bridge-frontend/commit/04a9a46db67a298c33493630ececcb15ed53dbcb))

# [1.7.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.6.0...v1.7.0) (2021-01-27)


### Features

* "new transfer" form ([cc945ea](https://github.com/near/rainbow-bridge-frontend/commit/cc945eaa8fa31378d9567550dab009692372362e))

# [1.6.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.8...v1.6.0) (2021-01-23)


### Features

* "begin new transfer" loads correct next form ([b5630e7](https://github.com/near/rainbow-bridge-frontend/commit/b5630e7ea0c570a58b0c8023138646edead1254c))

## [1.5.8](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.7...v1.5.8) (2021-01-22)


### Bug Fixes

* add (temp) step-size to amount inputs ([a7f7469](https://github.com/near/rainbow-bridge-frontend/commit/a7f7469a5c03d5084ca7f1546c0b661fa0882274))

## [1.5.7](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.6...v1.5.7) (2021-01-22)


### Bug Fixes

* use transfer.recipient instead of window.ethUserAddress ([0c2fff7](https://github.com/near/rainbow-bridge-frontend/commit/0c2fff7e94d99f7e5fd14c9533dd29a7aecd3eb8))

## [1.5.6](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.5...v1.5.6) (2021-01-22)


### Bug Fixes

* add missing from/to addresses in transfers ([6c07caf](https://github.com/near/rainbow-bridge-frontend/commit/6c07cafd9aa860a4bb8473478fc59a4aa6722429))
* **findProof:** accept limited (& correct) args ([553167d](https://github.com/near/rainbow-bridge-frontend/commit/553167d6aac768710664e2612da00b045e0be32d))

## [1.5.5](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.4...v1.5.5) (2021-01-20)


### Bug Fixes

* auto-recheck status for new transfers ([a79fe34](https://github.com/near/rainbow-bridge-frontend/commit/a79fe349d23d679856174638b3c1623cea6450f6))

## [1.5.4](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.3...v1.5.4) (2021-01-17)


### Bug Fixes

* re-add "token not yet bridged; bridge it" UI ([3cbb91b](https://github.com/near/rainbow-bridge-frontend/commit/3cbb91b4fb3a53f99ad6f1f963cbaa2e8e2d0183))

## [1.5.3](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.2...v1.5.3) (2021-01-17)


### Bug Fixes

* re-enable passing own erc20 by address in URL ([b75ac41](https://github.com/near/rainbow-bridge-frontend/commit/b75ac411669cbb915299cc8ed96f50fd7a184dbc))

## [1.5.2](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.1...v1.5.2) (2021-01-15)


### Bug Fixes

* **retries:** respond to MetaMask→Reject for lock ([d15d16e](https://github.com/near/rainbow-bridge-frontend/commit/d15d16e95ff93d63e9b47340b3ed9df08dae3981))

## [1.5.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.5.0...v1.5.1) (2020-12-18)


### Bug Fixes

* add calls to bridgedNep21ToErc20 where needed ([f8a2e44](https://github.com/near/rainbow-bridge-frontend/commit/f8a2e4456be9affd43d0bca168b67486f5686038))

# [1.5.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.4.1...v1.5.0) (2020-12-17)


### Features

* almost send a Bridged NEP21 back to Ethereum ([2f27b96](https://github.com/near/rainbow-bridge-frontend/commit/2f27b965faf8098b4e85cf1c01b9b9c2f4144340))

## [1.4.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.4.0...v1.4.1) (2020-11-01)


### Bug Fixes

* undefined 'get_balance' ([6aee36d](https://github.com/near/rainbow-bridge-frontend/commit/6aee36dd313c02cc5d4f23d40e26204bc41c2da9))

# [1.4.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.3.1...v1.4.0) (2020-11-01)


### Features

* add UI for selecting a featured ERC20 ([fd2f38f](https://github.com/near/rainbow-bridge-frontend/commit/fd2f38fec1d0b0e90a5e521f3614ccbdffa9b2e6))

## [1.3.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.3.0...v1.3.1) (2020-10-30)


### Bug Fixes

* add more functions to window ([9f9c7be](https://github.com/near/rainbow-bridge-frontend/commit/9f9c7be3e945fa82fdecde28a4e3caadbe4e63bc))
* mv NEP21 Contract init to call site ([43ac0b4](https://github.com/near/rainbow-bridge-frontend/commit/43ac0b454b2523b8380c05509b5988b4adef9548))

# [1.3.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.2.0...v1.3.0) (2020-10-29)


### Features

* BYO ERC20 ([ea9de4c](https://github.com/near/rainbow-bridge-frontend/commit/ea9de4c457d49873f63a6858340447fb063d6623))

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
