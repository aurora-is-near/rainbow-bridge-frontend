const onChangeFns = []

function localStorageGet (key) {
  try {
    const serializedState = localStorage.getItem(key)
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

function localStorageSet (key, state) {
  if (!key || !state) {
    throw new Error('expected two arguments, only got one')
  }
  const serializedState = JSON.stringify(state)
  localStorage.setItem(key, serializedState)
  Promise.all(onChangeFns.map(fn => fn()))
}

const STORAGE_KEY = 'rainbow-bridge-transfers'

function getAllRaw () {
  return localStorageGet(STORAGE_KEY) || {}
}

// Get raw transfers, stored in localStorage as an object indexed by keys
export async function getAll () {
  const raw = getAllRaw()
  return Object.keys(raw).sort().map(id => raw[id])
}

export async function get (id) {
  if (!id) throw new Error('must provide ID to fetch a single transfer')
  return getAllRaw()[id]
}

export async function add (transfer) {
  localStorageSet(STORAGE_KEY, {
    ...getAllRaw(),
    [transfer.id]: transfer
  })
}

// update a given transfer in localStorage, returning a new object with the
// updated version
export async function update (transfer, withData = {}) {
  if (!transfer.id) {
    throw new Error('Cannot update transfer with no ID')
  }
  const updatedTransfer = { ...transfer, ...withData }
  localStorageSet(STORAGE_KEY, {
    ...getAllRaw(),
    [transfer.id]: updatedTransfer
  })
  return updatedTransfer
}

// Clear a transfer from localStorage
export async function clear (id) {
  const transfers = getAllRaw()
  delete transfers[id]
  localStorageSet(STORAGE_KEY, transfers)
}

/**
 * Add a function to be called any time the data in storage is updated
 */
export function onChange (fn) {
  onChangeFns.push(fn)
}
