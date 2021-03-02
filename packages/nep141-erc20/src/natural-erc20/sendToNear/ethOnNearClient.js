import { keyStores, Near } from 'near-api-js'
import {
  deserialize as deserializeBorsh
} from 'near-api-js/lib/utils/serialize'

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  networkId: process.env.nearNetworkId,
  nodeUrl: process.env.nearNodeUrl
})

class EthOnNearClientBorsh {
  constructor (args) {
    Object.assign(this, args)
  }
}

const schema = new Map([
  [EthOnNearClientBorsh, {
    kind: 'struct',
    fields: [
      ['last_block_number', 'u64']
    ]
  }]
])

function deserializeEthOnNearClient (raw) {
  return deserializeBorsh(schema, EthOnNearClientBorsh, raw)
}

export async function lastBlockNumber () {
  // near-api-js requires instantiating an "account" object, even though view
  // functions require no signature and therefore no associated account, so the
  // account name passed in doesn't matter.
  const account = await near.account(process.env.nearClientAccount)
  const deserialized = await account.viewFunction(
    process.env.nearClientAccount,
    'last_block_number',
    {},
    { parse: deserializeEthOnNearClient }
  )
  return deserialized.last_block_number.toNumber()
}
