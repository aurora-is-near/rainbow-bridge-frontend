// Update DOM elements that have a "data-behavior" attribute
// Given `<span data-behavior="thing"></span>`
// You can `fill('thing').with('whatever')` to set the innerHTML
export const fill = selector => ({
  with: content =>
    Array.from(document.querySelectorAll(`[data-behavior=${selector}]`))
      .forEach(n => { n.innerHTML = content })
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
}
