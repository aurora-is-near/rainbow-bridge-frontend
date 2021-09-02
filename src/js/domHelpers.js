import render from './render'
import * as urlParams from './urlParams'

const isObject = x =>
  Object.prototype.toString.call(x) === '[object Object]'

const fillCache = {}

// Update DOM elements that have a "data-behavior" attribute
// Given `<span data-behavior="thing"></span>`
// You can `fill('thing').with('whatever')` to set the innerHTML
// You can pass an array, and it will be joined with empty string
// You can `fill('thing').with({ title: 'whatever' }) to set any other attribute
//
// The values filled are cached, so attempts to fill the same content multiple
// times will not cause unnecessary DOM manipulations
export const fill = selector => ({
  with: (contentOrAttrObj) => {
    const attrs = isObject(contentOrAttrObj)
      ? contentOrAttrObj
      : { innerHTML: contentOrAttrObj }
    Object.entries(attrs).forEach(([attr, content]) => {
      const contentString = Array.isArray(content)
        ? content.join('')
        : content
      if (fillCache[`${selector}:${attr}`] !== contentString) {
        fillCache[`${selector}:${attr}`] = contentString
        findAll(selector).forEach(n => {
          n[attr] = contentString
        })
      }
    })
  }
})

// A better String coercion than `String()`
export function toString (whatever) {
  if (!whatever) return ''

  return String(whatever)
}

// Attach a click event handler to elements with the specified
// "data-behavior" attribute
export function onClick (behavior, fn) {
  document.querySelector('body').addEventListener('click', event => {
    // did they click the thing?
    const thing = event.target.closest(`[data-behavior=${behavior}]`)
    if (thing) fn(event)
  })
}

// Find element with the given "data-behavior" attribute
export const find = selector =>
  document.querySelector(`[data-behavior="${selector}"]`)

// Find all elements with the given "data-behavior" attribute
// returns as array
export const findAll = selector =>
  Array.from(document.querySelectorAll(`[data-behavior="${selector}"]`))

// Hide DOM elements that have the given "data-behavior" attribute
export const hide = selector =>
  findAll(selector).forEach(n => { n.style.display = 'none' })

// Show DOM elements that have the given "data-behavior" attribute
export const show = (selector, display) =>
  findAll(selector)
    .forEach(n => {
      if (display) {
        n.style.display = display
      } else {
        n.style.removeProperty('display')
      }
    })

// call this once, after page load
export function init () {
  onClick('goHome', function goHome () {
    urlParams.clear('erc20n', 'erc20', 'new')
    render()
  })

  onClick('closeModal', function closeModal (e) {
    e.target.closest('.modal').style.display = 'none'
  })

  onClick('disconnectEthereum', async function disconnectEthereum (e) {
    await window.web3Modal.clearCachedProvider()
    localStorage.removeItem('walletconnect')
    setTimeout(() => window.location.reload())
  })

  onClick('disconnectNear', function disconnectNear () {
    window.nearConnection.signOut()
    setTimeout(() => window.location.reload())
  })

  onClick('newRecovery', function startTransferRecovery () {
    if (!(window.ethInitialized && window.nearInitialized)) return
    window.dom.show('locateTransfer')
    window.dom.hide('searchingTransfer')
    window.dom.hide('transferFound')
    window.dom.hide('noTransferFound')
    window.dom.find('txHashInput').value = ''
    window.urlParams.setPush({ new: 'restore' })
    render()
  })

  onClick('newTransfer', function startTransfer () {
    // Add url param with history.pushState to enable goBack.
    urlParams.setPush({ new: 'transfer' })
    window.render()
  })

  onClick('goBack', function goBack () {
    window.history.back()
  })

  // avoid page refreshes when submitting "get" forms
  document.querySelectorAll('form[method="get"]').forEach(form => {
    form.onsubmit = e => {
      e.preventDefault()

      // Replace url params with history.pushState to enable goBack.
      Array.from(e.target.elements).forEach(el => {
        if (el.name) urlParams.setPush({ [el.name]: el.value })
      })

      render()
    }
  })
}
