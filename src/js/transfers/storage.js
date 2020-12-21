import PouchDB from 'pouchdb-browser'

const LOCAL_DB = 'rainbow-bridge-transfers'
const REMOTE_DB = `https://apikey-a0d8c8c11d224196b7ea464c42e39a60:eb44e84a1120e186fb0af806d436cf2bb891ae58@32114ed0-9b02-4a9b-9f93-de07a5616483-bluemix.cloudant.com/rainbow-bridge-${process.env.nearNetworkId}`

const db = new PouchDB(LOCAL_DB)

PouchDB.replicate(REMOTE_DB, LOCAL_DB, {
  live: true,
  retry: true
})

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
