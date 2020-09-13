export function get (key) {
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

export function set (key, state) {
  if (!key || !state) {
    throw new Error('expected two arguments, only got one')
  }
  const serializedState = JSON.stringify(state)
  localStorage.setItem(key, serializedState)
}
