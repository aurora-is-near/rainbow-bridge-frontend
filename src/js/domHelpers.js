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
  document.querySelector('body').addEventListener('click', e => {
    if (e.target.dataset.behavior === behavior) fn()
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

// DOM handlers to be added once after page load
export const initDOMhandlers = () => {
  window.onClick('new-transfer-button', function startErc20Transfer () {
    window.urlParams.set({ erc20: '' })
    window.render()
  })
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
