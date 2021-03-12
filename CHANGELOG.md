## [2.1.4](https://github.com/near/rainbow-bridge-frontend/compare/v2.1.3...v2.1.4) (2021-03-12)


### Bug Fixes

* improve placeholder opacity for darkmode ([29cf37a](https://github.com/near/rainbow-bridge-frontend/commit/29cf37ae6c719deba8c4ef6f8bd1000b4413c0d6))
* UI improvements, add faucet link ([c400bae](https://github.com/near/rainbow-bridge-frontend/commit/c400bae85f6e0e3d97a49d598d464c835b8d51ca))

## [2.1.3](https://github.com/near/rainbow-bridge-frontend/compare/v2.1.2...v2.1.3) (2021-03-10)


### Bug Fixes

* update bridge urls ([81b40eb](https://github.com/near/rainbow-bridge-frontend/commit/81b40eb9c53c24cfff27bcc7180f8a9ce274aba3))

## [2.1.2](https://github.com/near/rainbow-bridge-frontend/compare/v2.1.1...v2.1.2) (2021-03-09)


### Bug Fixes

* don't query metadata (render) if wrong eth network ([0ca2ef0](https://github.com/near/rainbow-bridge-frontend/commit/0ca2ef0b1e10f1724723f37bd3d68f4294b51bec))
* rollback checkStatusAll api change ([6ed1a0c](https://github.com/near/rainbow-bridge-frontend/commit/6ed1a0c4fb474fe6219f96920653b9925701a15a))

## [2.1.1](https://github.com/near/rainbow-bridge-frontend/compare/v2.1.0...v2.1.1) (2021-03-04)


### Bug Fixes

* bump dependency to prevent double eth approve ([92e2204](https://github.com/near/rainbow-bridge-frontend/commit/92e2204f7f40bf26fe1d5fe53cae254d939627cf))
* improve error msg ([b9d3154](https://github.com/near/rainbow-bridge-frontend/commit/b9d31546d7a7ce1532259f2d7364dabd4d14a5c2))

# [2.1.0](https://github.com/near/rainbow-bridge-frontend/compare/v2.0.1...v2.1.0) (2021-03-02)


### Bug Fixes

* web3 modal theme ([164608a](https://github.com/near/rainbow-bridge-frontend/commit/164608af615bade470a3956461fb339a00b31482))


### Features

* add bridge selection component ([aeae966](https://github.com/near/rainbow-bridge-frontend/commit/aeae966d832d19b1986e3fd33223f464164b93b4))
* handle eth network change and bridge selection ([73a644c](https://github.com/near/rainbow-bridge-frontend/commit/73a644c70cad73b2577d203c35f7c98630f07d27))
* update config.js for single bridge FE deployment ([8e1cb1a](https://github.com/near/rainbow-bridge-frontend/commit/8e1cb1ad02a3eeff62fa61a0230397a977fc240a))

## [2.0.1](https://github.com/near/rainbow-bridge-frontend/compare/v2.0.0...v2.0.1) (2021-02-25)


### Bug Fixes

* improve max transfer amount ([f76e30c](https://github.com/near/rainbow-bridge-frontend/commit/f76e30ccfbd819d1144fee6da70f3abe6c8f1776))

# [2.0.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.11.1...v2.0.0) (2021-02-25)


* refactor!: use @near-eth npm published package ([55ee5c4](https://github.com/near/rainbow-bridge-frontend/commit/55ee5c4a6bce33ea7ed55972e45e6c1113f0de5a))


### Code Refactoring

* replace transfers/ with [@near](https://github.com/near)~eth ([dafb095](https://github.com/near/rainbow-bridge-frontend/commit/dafb09566e0325c365ec40cf9c15296b919425ea))


### BREAKING CHANGES

* new TRANSFER_TYPE requires deleting localStorage
* in @near~eth TRANSFER_TYPE is renamed (~ removed from
nep141-erc20)

## [1.11.1](https://github.com/near/rainbow-bridge-frontend/compare/v1.11.0...v1.11.1) (2021-02-24)


### Bug Fixes

* amount input step and min ([d950713](https://github.com/near/rainbow-bridge-frontend/commit/d950713a7a817ff5dea5dd0cd588f72ecd5453fb))
* hide erc20 modal on new custom token selection ([76e904b](https://github.com/near/rainbow-bridge-frontend/commit/76e904b3d24490b5eddf81c12167fab197c43264))

# [1.11.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.10.0...v1.11.0) (2021-02-19)


### Bug Fixes

* support big number transfer amounts ([023cae9](https://github.com/near/rainbow-bridge-frontend/commit/023cae9c34661907261ee93d8540c5a6d2e189b7))


### Features

* add token decimal support ([c08e23e](https://github.com/near/rainbow-bridge-frontend/commit/c08e23e1fb2428e8ad595a2321c65270e274c1bf))

# [1.10.0](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.11...v1.10.0) (2021-02-19)


### Features

* more robust `get` interface ([2b11783](https://github.com/near/rainbow-bridge-frontend/commit/2b11783cc67c3f975e3e982dbf033c46d04a31f0))

## [1.9.11](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.10...v1.9.11) (2021-02-17)


### Bug Fixes

* update token balances without page refresh ([cd1b276](https://github.com/near/rainbow-bridge-frontend/commit/cd1b27683915b173bd4a1c943ea81103e150a3e9))

## [1.9.10](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.9...v1.9.10) (2021-02-16)


### Bug Fixes

* bridge-erc20-form trying to load nonsense ([0c9ad4c](https://github.com/near/rainbow-bridge-frontend/commit/0c9ad4cf2676e9b14b8c36a452fb4d67b49f225b))

## [1.9.9](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.8...v1.9.9) (2021-02-16)


### Bug Fixes

* missed 'await' broke N→E transfers ([783151d](https://github.com/near/rainbow-bridge-frontend/commit/783151d3d65bddb3a90795a628dbfd562e8fcd24))
* NEAR sign out needs window.nearConnection ([3df78f5](https://github.com/near/rainbow-bridge-frontend/commit/3df78f56b7ddebd9d11888fea73af2fef1339459))

## [1.9.8](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.7...v1.9.8) (2021-02-15)


### Bug Fixes

* avoid non-user-initiated redirects to NEAR Wallet ([52d73ac](https://github.com/near/rainbow-bridge-frontend/commit/52d73ac4420e813b976293e7ce0b253b1c697ddc))

## [1.9.7](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.6...v1.9.7) (2021-02-13)


### Bug Fixes

* fix reference to undefined variable ([12965ae](https://github.com/near/rainbow-bridge-frontend/commit/12965ae12ba700a743688ebf82a248a8d0aa9a01))

## [1.9.6](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.5...v1.9.6) (2021-02-11)


### Bug Fixes

* near→eth transfers: rm security window step ([888f6f5](https://github.com/near/rainbow-bridge-frontend/commit/888f6f57a338687ef8b95e2f8cd4bfde2dbff16a))

## [1.9.5](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.4...v1.9.5) (2021-02-11)


### Bug Fixes

* show Ropsten or "bad network" banner ([030245f](https://github.com/near/rainbow-bridge-frontend/commit/030245f5e47dd63414747cf43524215130fb7cbd))

## [1.9.4](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.3...v1.9.4) (2021-02-10)


### Bug Fixes

* ropsten bridge requires 30 confirmations ([d87d386](https://github.com/near/rainbow-bridge-frontend/commit/d87d3866ca2a56ecf33f3b3bcb3c4c19eb9ef917))

## [1.9.3](https://github.com/near/rainbow-bridge-frontend/compare/v1.9.2...v1.9.3) (2021-02-09)


### Bug Fixes

* [workaround] withdraw by switching auth ([678cc56](https://github.com/near/rainbow-bridge-frontend/commit/678cc56f5ba80135e5eef0c0d8ab407b9a52f98e))
* near config & connection settings ([fd38350](https://github.com/near/rainbow-bridge-frontend/commit/fd3835016b7923b110ff900227426d2a551df93a))
* toExponential requires no arg ([cfcce1e](https://github.com/near/rainbow-bridge-frontend/commit/cfcce1e36096deddf125bdc7f1ad1217ccdbb9d0))

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
