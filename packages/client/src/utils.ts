import { ConnectedWalletAccount, WalletConnection } from 'near-api-js'
import { Decimal } from 'decimal.js'

let ethProvider: any // TODO add proper Ethereum Provider typing
let nearConnection: WalletConnection

/**
 * Set ethProvider
 *
 * This must be called by apps that use @near-eth/client before performing any
 * transfer operations with @near-eth/client itself or with connector libraries
 * such as @near-eth/nep141-erc20.
 *
 * Example:
 *
 *     import { ethers } from 'ethers'
 *     import { setEthProvider } from '@near-eth/client'
 *     setEthProvider(new ethers.providers.JsonRpcProvider())
 *
 * @param provider Ethereum Provider
 *
 * @returns `provider`
 */
export function setEthProvider (provider: any) {
  ethProvider = provider
  // TODO: verify provider meets expectations
  return ethProvider
}

/**
 * Set nearConnection
 *
 * This must be called by apps that use @near-eth/client before performing any
 * transfer operations with @near-eth/client itself or with connector libraries
 * such as @near-eth/nep141-erc20.
 *
 * Example:
 *
 *     import { Near, WalletConnection } from 'near-api-js'
 *     import { config, setNearConnection } from '@near-eth/client'
 *
 *     setNearConnection(new WalletConnection(
 *       new Near(config.ropsten.near)
 *     ))
 *
 * @param connection WalletConnection instance from near-api-js
 *
 * @returns `connection`
 */
export function setNearConnection (connection: WalletConnection) {
  nearConnection = connection
  // TODO: verify connection meets expectations
  return nearConnection
}

/**
 * Get ethProvider
 *
 * Internal function, only expected to be used by @near-eth/nep141-erc20 and
 * other connector libraries that interoperate with @near-eth/client. If you
 * are an app developer, you can ignore this function.
 *
 * @returns an Ethereum Provider for use with ethers.js or web3js
 */
export function getEthProvider () {
  return ethProvider
}

/**
 * Get NEAR Account for the nearConnection set by `setNearConnection`
 *
 * Internal function, only expected to be used by @near-eth/nep141-erc20 and
 * other connector libraries that interoperate with @near-eth/client. If you
 * are an app developer, you can ignore this function.
 *
 * Ensures that app called `setNearConnection`
 *
 * If `authAgainst` supplied and user is not signed in, will redirect user to
 * NEAR Wallet to sign in against `authAgainst` contract.
 *
 * If provided `strict: true`, will ENSURE that user is signed in against
 * `authAgainst` contract, and not just any contract address.
 *
 * @param {object} params Object with named arguments
 * @param params.authAgainst [undefined] string (optional) The address of a NEAR contract
 *   to authenticate against. If provided, will trigger a page redirect to NEAR
 *   Wallet if the user is not authenticated against ANY contract, whether this
 *   contract or not.
 * @param params.strict [false] boolean (optional) Will trigger a page redirect to NEAR
 *   Wallet if the user is not authenticated against the specific contract
 *   provided in `authAgainst`.
 *
 * @returns WalletAccount a NEAR account object, when it doesn't trigger a page redirect.
 */
export async function getNearAccount (
  { authAgainst, strict = false }: { authAgainst?: string, strict?: boolean } =
  { authAgainst: undefined, strict: false }
): Promise<ConnectedWalletAccount> {
  if (!nearConnection) {
    throw new Error(
      'Must `setNearConnection(new WalletConnection(near))` prior to calling anything from `@near-eth/client` or connector libraries'
    )
  }

  if (!authAgainst) return nearConnection.account()

  if (!nearConnection.getAccountId()) {
    // @ts-ignore: requestSignIn improperly typed
    await nearConnection.requestSignIn(authAgainst)
  }
  if (strict && !(await nearAuthedAgainst(authAgainst))) {
    nearConnection.signOut()
    // @ts-ignore: requestSignIn improperly typed
    await nearConnection.requestSignIn(authAgainst)
  }

  return nearConnection.account()
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
export async function nearAuthedAgainst (contract: string): Promise<boolean> {
  if (!contract) {
    throw new Error(
      `nearAuthedAgainst expects a valid NEAR contract address.
      Got: \`${contract}\``
    )
  }

  if (!nearConnection.getAccountId()) return false

  const { accessKey } = await nearConnection.account().findAccessKey() as any

  // TODO: this logic may break with FullAccess keys
  const authedAgainst = accessKey && accessKey.permission.FunctionCall.receiver_id
  return authedAgainst === contract
}

export function formatLargeNum (n, decimals = 18) {
  // decimals defaults to 18 for old transfers in state that didn't record transfer.decimals
  return new Decimal(n).dividedBy(10 ** decimals)
}
