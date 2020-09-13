import Web3 from 'web3'
import { BorshContract, hexToBuffer, readerToHex } from './borsh'

const borshSchema = {
  bool: {
    kind: 'function',
    // FIXME: use ethers instead of web3?
    ser: (b) => Buffer.from(Web3.utils.hexToBytes(b ? '0x01' : '0x00')),
    deser: (z) => readerToHex(1)(z) === '0x01'
  },
  initInput: {
    kind: 'struct',
    fields: [
      ['validate_ethash', 'bool'],
      ['dags_start_epoch', 'u64'],
      ['dags_merkle_roots', ['H128']],
      ['first_header', ['u8']],
      ['hashes_gc_threshold', 'u64'],
      ['finalized_gc_threshold', 'u64'],
      ['num_confirmations', 'u64']
    ]
  },
  dagMerkleRootInput: {
    kind: 'struct',
    fields: [['epoch', 'u64']]
  },
  addBlockHeaderInput: {
    kind: 'struct',
    fields: [
      ['block_header', ['u8']],
      ['dag_nodes', ['DoubleNodeWithMerkleProof']]
    ]
  },
  DoubleNodeWithMerkleProof: {
    kind: 'struct',
    fields: [
      ['dag_nodes', ['H512']],
      ['proof', ['H128']]
    ]
  },
  H128: {
    kind: 'function',
    ser: hexToBuffer,
    deser: readerToHex(16)
  },
  H256: {
    kind: 'function',
    ser: hexToBuffer,
    deser: readerToHex(32)
  },
  H512: {
    kind: 'function',
    ser: hexToBuffer,
    deser: readerToHex(64)
  },
  '?H256': {
    kind: 'option',
    type: 'H256'
  }
}

export default class EthOnNearClient extends BorshContract {
  constructor (account, contractId) {
    super(borshSchema, account, contractId, {
      viewMethods: [
        {
          methodName: 'initialized',
          inputFieldType: null,
          outputFieldType: 'bool'
        },
        {
          methodName: 'dag_merkle_root',
          inputFieldType: 'dagMerkleRootInput',
          outputFieldType: 'H128'
        },
        {
          methodName: 'last_block_number',
          inputFieldType: null,
          outputFieldType: 'u64'
        },
        {
          methodName: 'block_hash',
          inputFieldType: 'u64',
          outputFieldType: '?H256'
        },
        {
          methodName: 'known_hashes',
          inputFieldType: 'u64',
          outputFieldType: ['H256']
        },
        {
          methodName: 'block_hash_safe',
          inputFieldType: 'u64',
          outputFieldType: '?H256'
        }
      ],

      changeMethods: [
        {
          methodName: 'init',
          inputFieldType: 'initInput',
          outputFieldType: null
        },
        {
          methodName: 'add_block_header',
          inputFieldType: 'addBlockHeaderInput',
          outputFieldType: null
        }
      ]
    })
  }
}
