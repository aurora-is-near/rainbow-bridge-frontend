import BN from 'bn.js'
import { checkNearAuth } from '../utils'

/**
 * Deploy a BridgeToken contract for the given erc20Address.
 *
 * The [Fungible Token Connector](https://github.com/near/rainbow-token-connector)
 * allows sending any ERC20 token to NEAR, but requires an initial one-time
 * deploy of a "BridgeToken" contract. This call will deploy such a token.
 *
 * How do you know if you need to call this? How do you know if a given
 * erc20Address already has an existing BridgeToken contract deployed? Try to
 * check {@link getBalance} for a user; if it returns `null`, then the
 * BridgeToken is not deployed. Example:
 *
 *     const userNearAccount = 'example.near'
 *     const erc20Address = '0x123abc...'
 *     const bridgedNep141Balance = bridgedNep141.getBalance({
 *       erc20Address,
 *       user: userNearAccount
 *     })
 *     // Don't check `!bridgedNep141Balance`, because user may have a balance
 *     // of 0, which means the contract is deployed and they have no balance.
 *     // `0` in JavaScript is falsey.
 *     if (bridgedNep141Balance === null) {
 *       bridgeErc20(erc20Address)
 *     }
 *
 * @param erc20Address Address of ERC20 token for which to deploy BridgeToken
 *
 * @returns void Doesn't actually return at all, as the contract call has an
 * attached deposit (of 30.02 $NEAR) and will thus always cause a redirect to
 * NEAR Wallet for confirmation.
 */
export default async function deployBridgeToken (erc20Address) {
  await checkNearAuth(process.env.nearTokenFactoryAccount)

  // causes redirect to NEAR Wallet
  await window.nearConnection.account().functionCall(
    process.env.nearTokenFactoryAccount,
    'deploy_bridge_token',
    { address: erc20Address.replace('0x', '') },

    // Default gas limit used by near-api-js is 3e13, but this tx fails with
    // that number. Doubling it works. Maybe slightly less would also work,
    // but at min gas price of 100M yN, this will only amount to 0.006 $NEAR,
    // which is already negligible compared to the deposit.
    new BN(3e13).mul(new BN(2)),

    // Attach a deposit to compensate the BridgeTokenFactory contract for the
    // storage costs associated with deploying the new BridgeToken contract.
    // 30N for the base fee, plus .02 for for storing the name of the contract
    // Might not need full .02, but need more than .01, error message did not
    // include needed amount at time of writing.
    new BN(window.parseNearAmount('30.02'))
  )
}
