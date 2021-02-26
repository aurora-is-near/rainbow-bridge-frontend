import { fill } from './domHelpers'

// update the html based on user & data state
export default async function render () {
  if (window.ethUserAddress) {
    fill('ethUser').with({
      innerHTML: window.ethUserAddress,
      title: window.ethUserAddress
    })
  }

  if (window.nearUserAddress) {
    fill('nearUser').with({
      innerHTML: window.nearUserAddress,
      title: window.nearUserAddress
    })
  }

  fill('bridgeName').with({
    innerHTML: process.env.bridgeName,
    title: process.env.bridgeName
  })

  await Promise.all(window.renderers.map(r => r()))
}
