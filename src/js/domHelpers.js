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
}
