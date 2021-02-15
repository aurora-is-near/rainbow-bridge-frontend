/**
 * Ensure app has set `window.nearConnection` and that user is logged in with a NEAR account
 *
 * If not signed in, will request sign in against given `contract` address.
 * If provided `{ strict: true }`, will ensure that user is signed in against
 * given contract address, and not just any contract address.
 *
 * @param params Object with named arguments
 * @param params.authAgainst string (optional) The address of a NEAR contract to authenticate against. If provided, will trigger a page redirect to NEAR Wallet if the user is not authenticated against ANY contract, whether this contract or not.
 * @param params.strict boolean (optional) Will trigger a page redirect to NEAR Wallet if the user is not authenticated against the specific contract provided in `authAgainst`.
 *
 * @returns a NEAR account object, when it doesn't trigger a page redirect.
 */
export async function getNearAccount ({ authAgainst, strict = false } = {}) {
  if (!window.nearConnection) {
    throw new Error(
      'Must initialize `window.nearConnection = new WalletConnection(near)` prior to calling anything from nep141~erc20 library'
    )
  }

  if (!authAgainst) return window.nearConnection.account()

  if (!window.nearConnection.getAccountId()) {
    await window.nearConnection.requestSignIn(authAgainst)
  }
  if (strict && !nearAuthedAgainst(authAgainst)) {
    await window.nearConnection.signOut()
    await window.nearConnection.requestSignIn(authAgainst)
  }

  return window.nearConnection.account()
}

/**
 * Check that user is authenticated against the given `contract`.
 *
 * Put another way, make sure that current browser session has a FunctionCall
 * Access Key that allows it to call the given `contract` on behalf of the
 * current user.
 *
 * @param contract The address of a NEAR contract
 * @returns boolean True if the user is authenticated against this contract.
 */
export async function nearAuthedAgainst (contract) {
  if (!contract) {
    throw new Error(
      `nearAuthedAgainst expects a valid NEAR contract address.
      Got: \`${contract}\``
    )
  }

  if (!window.nearConnection.getAccountId()) return false

  const { accessKey } = await window.nearConnection.account().findAccessKey()
  const authedAgainst = accessKey && accessKey.permission.FunctionCall.receiver_id
  return authedAgainst === contract
}
