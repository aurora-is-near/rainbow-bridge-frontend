import * as localStorage from './localStorage'

const getKey = () =>
  `${window.ethUserAddress}-to-${window.nearUserAddress}`

export function get () {
  return localStorage.get(getKey()) || []
}

export function push (notification) {
  localStorage.set(getKey(), [...get(), notification])
}
