import { fill, hide, show } from './domHelpers'
import { get as getTransfers, humanStatusFor } from './transfers'
import { get as getParam } from './urlParams'
import { getErc20Name } from './ethHelpers'

const formatLargeNum = n => n >= 1e5 || (n < 1e-3 && n !== 0)
  ? n.toExponential(2)
  : new Intl.NumberFormat(undefined, { maximumSignificantDigits: 3 }).format(n)

async function renderTransfer (transfer, { inProgress }) {
  return `
    <div class="transfer" id="${transfer.id}" data-behavior="transfer">
      <header>
        ${inProgress ? (
          '<span class="loader" style="font-size: 0.75em; margin: -0.5em 0 0 -0.7em">in progress:</span>'
        ) : (
          `<span>${transfer.outcome === 'success' ? '🌈' : '😞'}</span>`
        )}
        <span>${transfer.amount}</span>
        <span>${transfer.erc20Name}</span>
        <span class="arrow ${
          inProgress ? 'animate' : transfer.outcome
        }">→</span>
        <span>${'n' + transfer.erc20Name}</span>
      </header>
      <div>
        <p>${humanStatusFor(transfer)}</p>
      </div>
      ${inProgress ? '' : `
        <footer>
          ${transfer.outcome === 'success' ? `
            <button data-behavior="delete-transfer">
              <span class="visually-hidden">clear</span>
              <span aria-hidden="true">⨉</span>
            </button>
          ` : `
            <button data-behavior="retry-transfer">
              <span class="visually-hidden">retry</span>
              <span aria-hidden="true" title="retry">↻</span>
            </button>
          `}
        </footer>
      `}
    </div>
  `
}

async function updateTransfers () {
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
    }
  }
  fill('notification-count').with(complete.length)

  fill('transfers-container').with(await Promise.all([
    ...complete.map(t => renderTransfer(t, { inProgress: false })),
    ...inProgress.map(t => renderTransfer(t, { inProgress: true }))
  ]))
}

// update the html based on user & data state
export default async function render () {
  fill('ethErc20AbiText').with(process.env.ethErc20AbiText)
  fill('ethLockerAddress').with(process.env.ethLockerAddress)
  fill('ethLockerAbiText').with(process.env.ethLockerAbiText)
  fill('nearNodeUrl').with(process.env.nearNodeUrl)
  fill('nearNetworkId').with(process.env.nearNetworkId)
  fill('nearFunTokenAccount').with(process.env.nearFunTokenAccount)
  fill('nearClientAccount').with(process.env.nearClientAccount)

  // if not signed in with both eth & near, stop here
  if (!window.ethUserAddress || !window.nearUserAddress) return

  const ethErc20Address = getParam('erc20')
  const ethErc20Name = await getErc20Name(ethErc20Address)

  fill('ethErc20Name').with(ethErc20Name)
  fill('ethErc20Address').with(ethErc20Address)
  fill('nearNep21Name').with('n' + ethErc20Name)

  if (ethErc20Address === '0x3e13318e92F0C67Ca10f0120372E998d43E6a8E8') {
    show('abound-token'); hide('not-abound-token')
  } else {
    hide('abound-token'); show('not-abound-token')
  }

  await updateTransfers()

  fill('ethUser').with(window.ethUserAddress)
  fill('nearUser').with(window.nearUserAddress)

  // how to get useful details about selected network in MetaMask?
  fill('ethNetworkName').with(await window.web3.eth.net.getNetworkType())

  const erc20Balance = await getErc20Balance()
  const nep21Balance = await getNep21Balance()

  fill('erc20Balance').with(formatLargeNum(erc20Balance))

  if (erc20Balance === 0) {
    show('balanceZero'); hide('balancePositive'); hide('notBridged')
  } else {
    if (nep21Balance === null) {
      show('notBridged'); hide('balanceZero'); hide('balancePositive')
    } else {
      fill('nep21Balance').with(formatLargeNum(nep21Balance))
      show('balancePositive'); hide('notBridged'); hide('balanceZero')
    }
  }

  hide('signed-out')
  show('signed-in')
}

async function getErc20Balance () {
  const erc20Contract = new window.web3.eth.Contract(
    JSON.parse(process.env.ethErc20AbiText),
    getParam('erc20'),
    { from: window.ethUserAddress }
  )

  return Number(
    await erc20Contract.methods.balanceOf(window.ethUserAddress).call()
  )
}
async function getNep21Balance () {
  return window.nep21
    .get_balance({ owner_id: window.nearUserAddress })
    .then(raw => Number(raw))
    .catch(() => null)
}
