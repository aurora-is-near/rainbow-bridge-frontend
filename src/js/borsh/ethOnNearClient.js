import {
  deserialize as deserializeBorsh
} from 'near-api-js/lib/utils/serialize'

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

// a small helper class to wrap a near-api-js Contract instance
export default class EthOnNearClient {
  constructor (contract) {
    this.contract = contract
  }

  async lastBlockNumber () {
    const deserialized = await this.contract.last_block_number(
      {},
      { parse: deserializeEthOnNearClient }
    )
    return deserialized.last_block_number.toNumber()
  }
}
