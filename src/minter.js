import Web3 from 'web3'
import { BorshContract, readerToHex } from './rainbow/borsh'

const borshSchema = {
  bool: {
    kind: 'function',
    // @ts-ignore
    ser: (b) => Buffer.from(Web3.utils.hexToBytes(b ? '0x01' : '0x00')),
    deser: (z) => readerToHex(1)(z) === '0x01'
  },
  Proof: {
    kind: 'struct',
    fields: [
      ['log_index', 'u64'],
      ['log_entry_data', ['u8']],
      ['receipt_index', 'u64'],
      ['receipt_data', ['u8']],
      ['header_data', ['u8']],
      ['proof', [['u8']]]
    ]
  }
}

export default class NearMintableToken extends BorshContract {
  constructor (account, contractId) {
    super(borshSchema, account, contractId, {
      viewMethods: [],
      changeMethods: [
        {
          methodName: 'mint',
          inputFieldType: 'Proof',
          outputFieldType: null
        }
      ]
    })
  }
}
