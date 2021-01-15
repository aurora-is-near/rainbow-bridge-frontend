import Tree from 'merkle-patricia-tree'
import { encode } from 'eth-util-lite'
import { Header, Proof, Receipt, Log } from 'eth-object'
import { promisfy } from 'promisfy'
import utils from 'ethereumjs-util'
import {
  Proof as BorshProof,
  schema as proofBorshSchema
} from '../../../borsh/mintableTokenFactory'
import { serialize as serializeBorsh } from 'near-api-js/lib/utils/serialize'

// Compute proof that Locked event was fired in Ethereum. This proof can then
// be passed to the FungibleTokenFactory contract, which verifies the proof
// against a Prover contract.
export default async function findProof (transfer) {
  const receipt = await window.web3.eth.getTransactionReceipt(transfer.lockReceipt.transactionHash)
  const block = await window.web3.eth.getBlock(transfer.lockReceipt.blockNumber)
  const tree = await buildTree(block)
  const proof = await extractProof(
    block,
    tree,
    receipt.transactionIndex
  )

  const lockHash = transfer.lockHashes[transfer.lockHashes.length - 1]
  const [lockedEvent] = await window.ethTokenLocker.getPastEvents('Locked', {
    filter: { transactionHash: lockHash },
    fromBlock: transfer.lockReceipt.blockNumber
  })
  // `log.logIndex` does not necessarily match the log's order in the array of logs
  const logIndexInArray = receipt.logs.findIndex(
    l => l.logIndex === lockedEvent.logIndex
  )
  const log = receipt.logs[logIndexInArray]

  const formattedProof = new BorshProof({
    log_index: logIndexInArray,
    log_entry_data: Array.from(Log.fromWeb3(log).serialize()),
    receipt_index: proof.txIndex,
    receipt_data: Array.from(Receipt.fromWeb3(receipt).serialize()),
    header_data: Array.from(proof.header_rlp),
    proof: Array.from(proof.receiptProof).map(utils.rlp.encode).map(b => Array.from(b))
  })

  return serializeBorsh(proofBorshSchema, formattedProof)
}

async function buildTree (block) {
  const blockReceipts = await Promise.all(
    block.transactions.map(t => window.web3.eth.getTransactionReceipt(t))
  )

  // Build a Patricia Merkle Trie
  const tree = new Tree()
  await Promise.all(
    blockReceipts.map(receipt => {
      const path = encode(receipt.transactionIndex)
      const serializedReceipt = Receipt.fromWeb3(receipt).serialize()
      return promisfy(tree.put, tree)(path, serializedReceipt)
    })
  )

  return tree
}

async function extractProof (block, tree, transactionIndex) {
  const [, , stack] = await promisfy(
    tree.findPath,
    tree
  )(encode(transactionIndex))

  const blockData = await window.web3.eth.getBlock(block.number)
  // Correctly compose and encode the header.
  const header = Header.fromWeb3(blockData)
  return {
    header_rlp: header.serialize(),
    receiptProof: Proof.fromStack(stack),
    txIndex: transactionIndex
  }
}
