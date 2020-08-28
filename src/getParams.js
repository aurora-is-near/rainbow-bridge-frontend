const params = new URLSearchParams(window.location.search)
export const erc20 = params.get('erc20')
export const abi = params.get('abi')

// if erc20 or abi are missing, redirect to defaults
const DEFAULT_ERC20 = '0xdeadbeef'
const DEFAULT_ABI = '0xdeadbeef.json'
if (!erc20 || !abi) {
  window.location.replace(
    window.location.origin +
    window.location.pathname +
    `?erc20=${DEFAULT_ERC20}&abi=${DEFAULT_ABI}`
  )
}
