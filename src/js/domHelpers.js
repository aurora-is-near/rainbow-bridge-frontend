import BN from 'bn.js'
import { utils } from 'near-api-js'
import {
  clear as clearTransfer,
  initiate as initiateTransfer,
  retry as retryTransfer
} from './transfers'
import render from './render'
import { get as getParam } from './urlParams'

// Update DOM elements that have a "data-behavior" attribute
// Given `<span data-behavior="thing"></span>`
// You can `fill('thing').with('whatever')` to set the innerHTML
export const fill = selector => ({
  with: content =>
    Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
      .forEach(n => {
        n.innerHTML = Array.isArray(content) ? content.join('') : content
        if (n.className.match('clip')) {
          n.title = content
        }
      })
})

// Hide DOM elements that have the given "data-behavior" attribute
export const hide = selector =>
  Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
    .forEach(n => { n.style.display = 'none' })

// Hide DOM elements that have the given "data-behavior" attribute
export const show = (selector, display) =>
  Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
    .forEach(n => {
      if (display) {
        n.style.display = display
      } else {
        n.style.removeProperty('display')
      }
    })

// DOM handlers to be added once after page load
export const initDOMhandlers = () => {
  document.querySelector('[data-behavior=logout]').onclick = async function logout () {
    await window.web3Modal.clearCachedProvider()
    window.nearConnection.signOut()
    setTimeout(() => window.location.reload())
  }

  document.querySelectorAll('.dropdown').forEach(d => {
    document.querySelector('body').addEventListener('click', event => {
      const button = d.querySelector('button')
      const clickedButton = button.contains(event.target)
      const clickedInDropdown = d.contains(event.target)
      const classNames = Array.from(d.classList)
      const active = classNames.includes('active')

      if (!active) {
        if (clickedButton) {
          d.className = [...classNames, 'active'].join(' ')
        }
      } else {
        if (clickedButton || !clickedInDropdown) {
          d.className = classNames.filter(c => c !== 'active').join(' ')
        }
      }
    })
  })

  document.querySelector('input#amount').oninput = (event) => {
    const submitButton = document.querySelector('main form button')

    if (event.target.value > 0) {
      submitButton.disabled = false
    } else {
      submitButton.disabled = true
    }
  }

  document.querySelector('main form').onsubmit = async (event) => {
    event.preventDefault()

    // get elements from the form using their id attribute
    const { amount, fieldset, submit } = event.target.elements

    // disable the form while the tokens get locked in Ethereum
    fieldset.disabled = true

    try {
      await initiateTransfer({
        amount: amount.value,
        callback: render,
        erc20: getParam('erc20')
      })
    } catch (e) {
      alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
      )
      throw e
    } finally {
      // re-enable the form, whether the call succeeded or failed
      fieldset.disabled = false
    }

    // if the call succeeded, reset the form
    amount.value = ''
    submit.disabled = true
    await render()
    const transfersButton = document.querySelector('#transfers button')
    transfersButton.click()
    transfersButton.focus()
  }

  // transfers are rendered after page load, so we add one click handler to the
  // body tag to handle clicking the "delete" button on any of them
  document.querySelector('body').addEventListener('click', event => {
    const clearTransferButton = event.target.closest('[data-behavior=delete-transfer]')

    // no delete button clicked, end here
    if (!clearTransferButton) return

    const transferId = clearTransferButton.closest('[data-behavior=transfer]').id
    clearTransfer(transferId)
    render()
  })

  // transfers are rendered after page load, so we add one click handler to the
  // body tag to handle clicking the "retry" button on any of them
  document.querySelector('body').addEventListener('click', event => {
    const retryTransferButton = event.target.closest('[data-behavior=retry-transfer]')

    // no retry button clicked, end here
    if (!retryTransferButton) return

    const transferId = retryTransferButton.closest('[data-behavior=transfer]').id
    retryTransfer(transferId, render)
  })

  document.querySelector('[data-behavior=notBridged] button').onclick = function bridgeIt () {
    window.nearFungibleTokenFactory.deploy_bridge_token(
      { address: getParam('erc20').replace('0x', '') },

      // Default gas limit used by near-api-js is 3e13, but this tx fails with
      // that number. Doubling it works. Maybe slightly less would also work,
      // but at min gas price of 100M yN, this will only amount to 0.006 $NEAR,
      // which is already negligible compared to the deposit.
      new BN(3e13).mul(new BN(2)),

      // Attach a deposit to compensate the BridgeTokenFactory contract for the
      // storage costs associated with deploying the new BridgeToken contract.
      // 30N for the base fee, plus .02 for for storing the name of the contract
      // Might not need full .02, but need more than .01, error message did not
      // include needed amount at time of writing.
      new BN(utils.format.parseNearAmount('30.02'))
    )
  }
}
