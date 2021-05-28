# [3.5.0](https://github.com/aurora-is-near/rainbow-bridge-frontend/compare/v3.4.4...v3.5.0) (2021-05-28)


### Bug Fixes

* Enable browser back button. ([9efa74e](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/9efa74e4c9cebd1f057a19e42f8450c2d41f67e9))
* Enable remove transfer before lock transaction is made ([82e5e07](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/82e5e072cee6f217c0a202ef841aab724d065de7))
* Handle bridging redirect ([90fa12c](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/90fa12c3a397e5a7a49d665ff90ca4c636e3eeb4))
* Improve tx modals ([b0f366f](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/b0f366f1c273bd865481c6c6fa362381f52cd7bc))
* Make failed transfer from NEAR deletable. ([5503293](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/5503293871840bb62299a7242a0559faa3fb2345))
* Remove rainbow-bridge-cli to upgrade eth-object ([b13b908](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/b13b90857c842d78f21986d9048256527dfa0952))
* Upgrade nep141-erc20 with bridging redirect ([35e0e75](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/35e0e750e1420e4de1ad6e6a5ddd84c98d5b5dc1))


### Features

* Add eNEAR transfers. ([8d180f0](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/8d180f09f4b95196a9624c28e4494bcf9fe510e2))
* Add max amount transfer ([e7cdcf7](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/e7cdcf709971e924901c75449f22d56447c41a14))
* Add nearTxModal to BridgeIt ([2387d1a](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/2387d1aa9784cd1129a45f2bb09adf9a2dfb023d))
* Add tx signing instructions modal ([6b015f4](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/6b015f46ca094c816e756aa458fe3d446e73626b))
* Display restored transfer status. ([10a0e91](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/10a0e91cd185f7eb02efeff49cca8dde5692b5b6))
* Record bridge direction in localStorage. ([ffb5121](https://github.com/aurora-is-near/rainbow-bridge-frontend/commit/ffb5121b62eb6f26664857ff815501390147d790))



## [3.4.4](https://github.com/near/rainbow-bridge-frontend/compare/v3.4.3...v3.4.4) (2021-04-20)


### Bug Fixes

* update ethClient contract, order tokens alphabetically ([11d42de](https://github.com/near/rainbow-bridge-frontend/commit/11d42de64b3ed0e3544a30f58656248226e5b141))

## [3.4.3](https://github.com/near/rainbow-bridge-frontend/compare/v3.4.2...v3.4.3) (2021-04-14)


### Bug Fixes

* hide transfers on landing if no transfers ([7abacdb](https://github.com/near/rainbow-bridge-frontend/commit/7abacdb0ee6ab69056c22814bf9a2c0ac10f1cd3))

## [3.4.2](https://github.com/near/rainbow-bridge-frontend/compare/v3.4.1...v3.4.2) (2021-04-14)


### Bug Fixes

* always display transfers page as default ([7a1476f](https://github.com/near/rainbow-bridge-frontend/commit/7a1476f603e395285b58a35697abda6470f817f1))
* enable remove transfer before lock transaction is made ([621a012](https://github.com/near/rainbow-bridge-frontend/commit/621a012552b934144dd4f2105ec2f4ca5e5991f7))
* enable restore from landing page ([02e7f28](https://github.com/near/rainbow-bridge-frontend/commit/02e7f28c48060c69a217532027bc3abb0105bffc))
* prevent deleting transfer if it is a withdrawal from NEAR ([ea65c83](https://github.com/near/rainbow-bridge-frontend/commit/ea65c83dbabc2f9a507d918df6b8f38cbc5127c0))
* remove css transition on every transfers list render ([ba72658](https://github.com/near/rainbow-bridge-frontend/commit/ba7265852f766aa1a5aace445c8a5a1eead1e261))
* reset selection on erc20Modal open ([2e90567](https://github.com/near/rainbow-bridge-frontend/commit/2e905670ce18912f3905e3845a158df3c7af624e))
* simplify text on token setup screen ([910bdfe](https://github.com/near/rainbow-bridge-frontend/commit/910bdfea07cedce0b53515891d572fcc977b4a76))

## [3.4.1](https://github.com/near/rainbow-bridge-frontend/compare/v3.4.0...v3.4.1) (2021-04-13)


### Bug Fixes

* handle close modal during switch wallet, center button ([39ade05](https://github.com/near/rainbow-bridge-frontend/commit/39ade05bbd3eb9bd1b6ae537e80bf25123b52eda))
* switch wallet from unsuported network ([98b3b88](https://github.com/near/rainbow-bridge-frontend/commit/98b3b888b299ca8932aef20083fedc758694651b))

# [3.4.0](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.7...v3.4.0) (2021-04-13)


### Features

* remember custom erc20 addresses, tokens with balance on top ([92111b9](https://github.com/near/rainbow-bridge-frontend/commit/92111b9e54472a89157284c722c0fdc3461318b2))

## [3.3.7](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.6...v3.3.7) (2021-04-07)


### Bug Fixes

* fix amount input field step/min/max rounding ([a236f7d](https://github.com/near/rainbow-bridge-frontend/commit/a236f7d7d10d4debba015819c740cae85c4e6257))

## [3.3.6](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.5...v3.3.6) (2021-04-07)


### Bug Fixes

* update client addr, delete walletconnect on disconnect ([92d81ce](https://github.com/near/rainbow-bridge-frontend/commit/92d81ce7292b4235c6db4e8b3508846e59acebe0))

## [3.3.5](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.4...v3.3.5) (2021-04-07)


### Bug Fixes

* fixes after rebase ([d03d4d3](https://github.com/near/rainbow-bridge-frontend/commit/d03d4d32d00c7a64c3bcac451db1a7f13512191e))
* prevent user from double clicking transfer action ([186bdf4](https://github.com/near/rainbow-bridge-frontend/commit/186bdf4bf53ff45ec3cecc51f71fb3bc3c246acb))
* remove duplicate act() call ([1befd94](https://github.com/near/rainbow-bridge-frontend/commit/1befd943766a2e118b7342e766e4a7ff8799d8f6))
* upgrade web3 and walletConnect to fix getTransactionReceipt().status ([8b96bec](https://github.com/near/rainbow-bridge-frontend/commit/8b96bec1f2ab82b9ade7dea0eb390d5a295e9906))

## [3.3.4](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.3...v3.3.4) (2021-04-06)


### Bug Fixes

* center bridge it! button ([36253af](https://github.com/near/rainbow-bridge-frontend/commit/36253afd6301cf804812cfe3725508a7ba1e7cb6))
* fix auto scroll and activate restore ([1518374](https://github.com/near/rainbow-bridge-frontend/commit/151837439e8319c174aa75447c22abc5146c6b34))
* fix banner warning text ([52f6fbe](https://github.com/near/rainbow-bridge-frontend/commit/52f6fbe7357c5b75bd27aae3742222350188f717))
* fix network dropdown display when mainnet ([bd67401](https://github.com/near/rainbow-bridge-frontend/commit/bd674017597ba46906c738962867c127299acfb5))

## [3.3.3](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.2...v3.3.3) (2021-04-02)


### Bug Fixes

* clear only relevant url param ([4ffa622](https://github.com/near/rainbow-bridge-frontend/commit/4ffa622890f9f8707d897a0d2a128a8a8ff7c732))
* update [@near-eth](https://github.com/near-eth), fix requestSignIn ([d3dc830](https://github.com/near/rainbow-bridge-frontend/commit/d3dc83033efd7123fd3b2b1499ae63c1c650125d))

## [3.3.2](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.1...v3.3.2) (2021-04-01)


### Bug Fixes

* requestSignIn requires contractId now ([719494a](https://github.com/near/rainbow-bridge-frontend/commit/719494a80077bd1e8a0db3e3a94b49d7be331f10))

## [3.3.1](https://github.com/near/rainbow-bridge-frontend/compare/v3.3.0...v3.3.1) (2021-03-31)


### Bug Fixes

* new transfer button position + upgrade [@near-eth](https://github.com/near-eth) transfer steps ([aed213b](https://github.com/near/rainbow-bridge-frontend/commit/aed213b200e649d062d6e8ffc71d3c938c02bdc2))

# [3.3.0](https://github.com/near/rainbow-bridge-frontend/compare/v3.2.3...v3.3.0) (2021-03-31)


### Bug Fixes

* disable submit on amount <= O ([88775ce](https://github.com/near/rainbow-bridge-frontend/commit/88775ce35509582aec9920793d8def27fb1df1b6))
* fix getAllowance api change ([08fab13](https://github.com/near/rainbow-bridge-frontend/commit/08fab13b6262c300409b42a7c4a63237eda8522b))


### Features

* skip approval if enough allowance ([9a70f56](https://github.com/near/rainbow-bridge-frontend/commit/9a70f56714fd715a42637e72fa14d7a4592b750b))

## [3.2.3](https://github.com/near/rainbow-bridge-frontend/compare/v3.2.2...v3.2.3) (2021-03-31)


### Bug Fixes

* clean url params on goBack ([a482ec8](https://github.com/near/rainbow-bridge-frontend/commit/a482ec80877d92f3e34ce452a3e2f483ace10cbb))

## [3.2.2](https://github.com/near/rainbow-bridge-frontend/compare/v3.2.1...v3.2.2) (2021-03-31)


### Bug Fixes

* update naj, remove contract access key ([85561c8](https://github.com/near/rainbow-bridge-frontend/commit/85561c8e4a7a3714504e8f7fa4ebcca1952cbc69))

## [3.2.1](https://github.com/near/rainbow-bridge-frontend/compare/v3.2.0...v3.2.1) (2021-03-19)


### Bug Fixes

* add faucet link ([e0ce661](https://github.com/near/rainbow-bridge-frontend/commit/e0ce661ffe7931162b959e2cdd5f58482ce4f84a))
* add telegram link ([7cfe010](https://github.com/near/rainbow-bridge-frontend/commit/7cfe010b0870af13bc3dd7b4e230a1dea5200c55))
* mainnet launch fixes ([a9f40b3](https://github.com/near/rainbow-bridge-frontend/commit/a9f40b317dbcd4c5c236c2604a6b8fce7c121e28))
* update ledger banner ([94e262d](https://github.com/near/rainbow-bridge-frontend/commit/94e262dc241cd6060fbbb06e5d01e82813cf3e8d))
* update telegram link ([6066d0e](https://github.com/near/rainbow-bridge-frontend/commit/6066d0ee24023ce83908960a59dd64110429a24b))

# [3.2.0](https://github.com/near/rainbow-bridge-frontend/compare/v3.1.0...v3.2.0) (2021-03-19)


### Features

* add transfer removal and confirmation ([53b54be](https://github.com/near/rainbow-bridge-frontend/commit/53b54be091033c0502fd4083ea7089fd642840ba))

# [3.1.0](https://github.com/near/rainbow-bridge-frontend/compare/v3.0.1...v3.1.0) (2021-03-19)


### Features

* add tx recovery from deposit hash ([850aecf](https://github.com/near/rainbow-bridge-frontend/commit/850aecfef0c4a00cb15f84269e5854800db914e2))
* implement new restore design ([c02fe83](https://github.com/near/rainbow-bridge-frontend/commit/c02fe831fdd0d702494780bdb20f52b9d8e84532))
* support near and eth recovery ([404bca8](https://github.com/near/rainbow-bridge-frontend/commit/404bca800fbafd58ae3cc1f2cbd56115ffdcc46b))

## [3.0.1](https://github.com/near/rainbow-bridge-frontend/compare/v3.0.0...v3.0.1) (2021-03-18)


### Bug Fixes

* disconnect on walletconnect session end ([3770d33](https://github.com/near/rainbow-bridge-frontend/commit/3770d3336443504aaefc3b8df34ca0bf5178ee10))
* walletconnect ([91649da](https://github.com/near/rainbow-bridge-frontend/commit/91649da0abe204ba8bb0f964774f20b9e314e9a0))

# [3.0.0](https://github.com/near/rainbow-bridge-frontend/compare/v2.1.4...v3.0.0) (2021-03-18)


### Features

* upgrade to nep141 bridge ([d2db524](https://github.com/near/rainbow-bridge-frontend/commit/d2db5244137655cbc7784f698ddf99817c3bf32d))


### BREAKING CHANGES

* new bridge

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

This version of the app can successfully send [Abundance Tokens (ABND)](http://chadoh.com/abundance-token/) (a test token you can mint to yourself) from [Rinkeby](https://support.airswap.io/en/articles/2831385-what-is-rinkeby) to [NEAR Testnet](https://docs.near.org/docs/concepts/networks#testnet)

With legible, framework-free (aka "vanilla JS") code, you can feel confident using this as a starting point for your own "Dapps on the bridge"

What's missing?

* You cannot send the wrapped Abundance Tokens (`nABND`) back to Ethereum
* You cannot send a different ERC20 without deploying your own "Connector" contracts. Soon there will be a [generic connector](https://github.com/near/rainbow-token-connector) that will allow sending any ERC20 across the bridge. It will also let you send native NEAR fungible tokens (the [NEP21](https://github.com/nearprotocol/NEPs/blob/master/specs/Standards/Tokens/FungibleToken.md) standard) to Ethereum and back again.
* The code in `transfers.js` needs to be extracted to a library

In addition, some details about how the Rainbow Bridge currently works are under active development. This app will be updated to reflect these changes, with semantic versioning used to indicate the severity of the change.
