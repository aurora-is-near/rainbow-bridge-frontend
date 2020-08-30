// Update DOM elements that have a "data-behavior" attribute
// Given `<span data-behavior="thing"></span>`
// You can `fill('thing').with('whatever')` to set the innerHTML
export const fill = selector => ({
  with: content =>
    Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
      .forEach(n => { n.innerHTML = content })
})

/* SIDE EFFECTS
 *
 * Including this file in index.js has side effects!
 * It adds the following handlers to the DOM
 */
document.querySelectorAll('.dropdown').forEach(d => {
  d.onclick = () => {
    d.className = d.className.match('active')
      ? 'dropdown'
      : 'dropdown active'
  }
})
