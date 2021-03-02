/**
 * Given an erc20 contract address, get the NEAR contract address of the
 * corresponding BridgeToken contract.
 *
 * @param erc20Address Contract address of an ERC20 token on Ethereum
 * @returns string Contract address of NEP141 BridgeToken on Ethereum
 */
export default function getNep141Address (erc20Address) {
  return erc20Address.replace('0x', '').toLowerCase() +
    '.' +
    process.env.nearTokenFactoryAccount
}
