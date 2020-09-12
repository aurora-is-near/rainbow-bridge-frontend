import { fill, hide, show } from './domHelpers'
import { get as getTransfers, humanStatusFor } from './transfers'

const formatLargeNum = n => n >= 1e5 || (n < 1e-3 && n !== 0)
  ? n.toExponential(2)
  : new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3 }).format(n)

function updateTransfers () {
  const { inProgress, complete } = getTransfers()

  if (!inProgress.length && !complete.length) {
    show('transfers-none')
    hide('transfers-in-progress')
    hide('transfers-all-complete')
  } else {
    hide('transfers-none')
    if (inProgress.length) {
      show('transfers-in-progress'); hide('transfers-all-complete')
    } else {
      hide('transfers-in-progress'); show('transfers-all-complete')
      fill('notification-count').with(complete.length)
    }

    fill('transfers-container').with(
      complete.map(transfer => `
        <div class="transfer" id="${transfer.id}" data-behavior="transfer">
          <header>
            <span>${transfer.outcome === 'success' ? '🌈' : '😞'}</span>
            <span>${transfer.amount}</span>
            <span>${process.env.ethErc20Name}</span>
            <span class="arrow ${transfer.outcome} ${
              transfer.status !== 'complete' && 'animate '
            }">→</span>
            <span>${process.env.nearNep21Name}</span>
          </header>
          <div>
            <p>${humanStatusFor(transfer)}</p>
          </div>
          <footer>
            <button data-behavior="delete-transfer">
              <span class="visually-hidden">clear</span>
              <span aria-hidden="true">⨉</span>
            </button>
          </footer>
        </div>
      `).join('') +
      inProgress.map(transfer => `
        <div class="transfer">
          <header>
            <span class="loader" style="font-size: 0.75em; margin: -0.5em 0 0 -0.7em">in progress:</span>
            <span>${transfer.amount}</span>
            <span>${process.env.ethErc20Name}</span>
            <span class="arrow animate">→</span>
            <span>${process.env.nearNep21Name}</span>
          </header>
          <div>
            <p>${humanStatusFor(transfer)}</p>
          </div>
        </div>
      `).join('')
    )
  }
}

// update the html based on user & data state
export default async function render () {
  fill('ethNodeUrl').with(process.env.ethNodeUrl)
  fill('ethErc20Name').with(process.env.ethErc20Name)
  fill('ethErc20Address').with(process.env.ethErc20Address)
  fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
  fill('ethLockerAddress').with(process.env.ethLockerAddress)
  fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
  fill('nearNodeUrl').with(process.env.nearNodeUrl)
  fill('nearNetworkId').with(process.env.nearNetworkId)
  fill('nearNep21Name').with(process.env.nearNep21Name)
  fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
  fill('nearClientAccount').with(process.env.nearClientAccount)

  // if not signed in with both eth & near, stop here
  if (!window.ethUserAddress || !window.nearUserAddress) return

  updateTransfers()

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)

  // how to get useful details about selected network in MetaMask?
  fill('ethNetworkName').with(await window.web3.eth.net.getNetworkType())

  const erc20Balance = Number(
    await window.erc20.methods.balanceOf(window.ethUserAddress).call()
  )
  fill('erc20Balance').with(formatLargeNum(erc20Balance))

  if (erc20Balance) {
    hide('balanceZero'); show('balancePositive')
  } else {
    show('balanceZero'); hide('balancePositive')
  }

  const nep21Balance = Number(await window.nep21.get_balance({ owner_id: window.nearUserAddress }))
  fill('nep21Balance').with(formatLargeNum(nep21Balance))

  hide('signed-out')
  show('signed-in', 'flex')
}
