/**
 * Ensure app has set `window.nearConnection` and that user is logged in with a NEAR account
 *
 * If not signed in, will request sign in against given `contract` address.
 * If provided `{ strict: true }`, will ensure that user is signed in against
 * given contract address, and not just any contract address.
 *
 * @param contract The address of a NEAR contract
 * @returns void Throws an error, if no `window.nearConnection` set.
 *   Redirects to NEAR Wallet for authentication, if user not signed in.
 *   Otherwise, no action is taken.
 */
export async function checkNearAuth (contract, { strict = false } = {}) {
  if (!window.nearConnection) {
    throw new Error(
      'Must initialize `window.nearConnection = new WalletConnection(near)` prior to calling anything from nep141~erc20 library'
    )
  }
  if (!window.nearConnection.getAccountId()) {
    await window.nearConnection.requestSignIn(contract)
  }
  if (strict && !userAuthedAgainst(contract)) {
    await window.nearConnection.signOut()
    await window.nearConnection.requestSignIn(contract)
  }
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
export async function userAuthedAgainst (contract) {
  if (!contract) {
    throw new Error(
      `userAuthedAgainst expects a valid NEAR contract address.
      Got: \`${contract}\``
    )
  }

  if (!window.nearConnection.getAccountId()) return false

  const { accessKey } = await window.nearConnection.account().findAccessKey()
  const authedAgainst = accessKey && accessKey.permission.FunctionCall.receiver_id
  return authedAgainst === contract
}
