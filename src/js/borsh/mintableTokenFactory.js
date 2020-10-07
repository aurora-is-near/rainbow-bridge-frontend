export class Proof {
  constructor (proof) {
    Object.assign(this, proof)
  }
}

export const schema = new Map([
  [Proof, {
    kind: 'struct',
    fields: [
      ['log_index', 'u64'],
      ['log_entry_data', ['u8']],
      ['receipt_index', 'u64'],
      ['receipt_data', ['u8']],
      ['header_data', ['u8']],
      ['proof', [['u8']]]
    ]
  }]
])
