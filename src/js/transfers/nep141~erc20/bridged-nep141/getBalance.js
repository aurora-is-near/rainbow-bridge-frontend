import getNep141Address from './getAddress'
import { getNearAccount } from '../../utils'

/**
 * Given an erc20 contract address, get the balance of user's equivalent NEP141.
 *
 * @param params Uses Named Arguments pattern, please pass arguments as object
 * @param params.erc20Address Contract address of an ERC20 token on Ethereum
 * @param params.user NEAR account address
 *
 * @returns {Promise<number|null>} if BridgeToken has been deployed, returns balance for `params.user`.
 *   Otherwise, returns `null`.
 */
export default async function getBalance ({ erc20Address, user }) {
  const nep141Address = getNep141Address(erc20Address)

  const nearAccount = await getNearAccount()

  try {
    const balanceAsString = await nearAccount.viewFunction(
      nep141Address,
      'get_balance',
      { owner_id: user }
    )
    return balanceAsString
  } catch (e) {
    console.warn(e)
    return null
  }
}
