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
}

const STORAGE_KEY = 'rainbow-bridge-transfers'

// Get raw transfers, stored in localStorage as an object indexed by keys
export function getAll () {
  return localStorageGet(STORAGE_KEY) || {}
}

export function get (id) {
  if (!id) throw new Error('must provide ID to fetch a single transfer')
  return getAll()[id]
}

export function add (transfer) {
  localStorageSet(STORAGE_KEY, {
    ...getAll(),
    [transfer.id]: transfer
  })
}

// update a given transfer in localStorage, returning a new object with the
// updated version
export function update (transfer, withData) {
  const updatedTransfer = { ...transfer, ...withData }
  localStorageSet(STORAGE_KEY, {
    ...getAll(),
    [transfer.id]: updatedTransfer
  })
  return updatedTransfer
}

// Clear a transfer from localStorage
export function clear (id) {
  const transfers = getAll()
  delete transfers[id]
  localStorageSet(STORAGE_KEY, transfers)
}
