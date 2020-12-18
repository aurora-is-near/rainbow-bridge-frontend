import PouchDB from 'pouchdb-browser'

const db = new PouchDB('rainbow-bridge-transfers')
const remoteCouch = false // eslint-disable-line no-unused-vars

// Get raw transfers, stored in localStorage as an object indexed by keys
export async function getAll () {
  const result = await db.allDocs({
    include_docs: true,
    descending: true
  })
  return result.rows.map(r => r.doc)
}

export async function get (id) {
  if (!id) {
    console.error(new Error('tried to fetch transfer with blank id'))
    return null
  }
  return await db.get(id)
}

export async function add (transfer) {
  const { rev } = await db.put({
    _id: transfer.id,
    ...transfer
  })
  return { ...transfer, _rev: rev }
}

// update a given transfer in localStorage, returning a new object with the
// updated version
export async function update (transfer, withData) {
  const updatedTransfer = { ...transfer, ...withData }
  const { rev } = await db.put(updatedTransfer)
  return { ...updatedTransfer, _rev: rev }
}

// Clear a transfer from localStorage
export async function clear (id) {
  return await db.remove(id)
}

export function onChange (fn) {
  db.changes({
    since: 'now',
    live: true
  }).on('change', fn)
}
