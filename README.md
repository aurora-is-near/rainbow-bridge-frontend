Rainbow Bridge Client Libraries
===============================

Monorepo containing NEAR-maintained libraries for using the Rainbow Bridge from an app (or, someday, CLI)


Contributing
============

Want to help improve any of these libraries? Thank you! Here are some steps to get started with running this repository on your own machine:

* Make sure you have [Node.js] and the latest [yarn] installed
* Clone the code
* `cd` into the repo

This project uses [Yarn 2](https://yarnpkg.com/getting-started/migration) in [Zero-Install mode](https://yarnpkg.com/features/zero-installs) so you shouldn't have to run `yarn install` when you first clone this repository.

If you use an editor other than VS Code or vim to work on this codebase, you may want to add Yarn 2 editor support to your local project [using `yarn dlx @yarnpkg/pnpify --sdk`](https://yarnpkg.com/getting-started/editor-sdks). Settings for VS Code & vim are checked into the repo.

Now you should be able to run project scripts:

* `yarn lint`
* `yarn workspaces foreach run build`

You should also see eslint & TypeScript support in your editor.

  [Node.js]: https://nodejs.org/en/download/package-manager/
  [yarn]: https://yarnpkg.com/
