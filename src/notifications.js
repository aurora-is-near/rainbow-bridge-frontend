import * as localStorage from './localStorage'

const getKey = () =>
  `${process.env.ethErc20Address}-to-${process.env.nearFunTokenAccount}`

export function get () {
  return localStorage.get(getKey()) || []
}

export function push (notification) {
  localStorage.set(getKey(), [...get(), notification])
}
