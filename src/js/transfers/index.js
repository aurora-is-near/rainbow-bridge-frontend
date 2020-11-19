import { ulid } from 'ulid'
import * as naturalErc20ToNep21 from './natural-erc20-to-nep21'
import * as bridgedNep21ToErc20 from './bridged-nep21-to-erc20'
import * as urlParams from '../urlParams'
import * as storage from './storage'
import { COMPLETE } from './statuses'

// Initiate a new transfer of 'amount' tokens. Must provide one of:
//
//   • naturalErc20: an address of a natural ERC20 to send to NEAR
//   • nep21FromErc20: address of an NEP21 to send back to Ethereum
//
// Currently depends on many global variables:
//
// * window.web3: constructing a Proof of the `Locked` event currently has deep
//   coupling with the web3.js library. Make initialized library available here.
// * window.ethTokenLocker: a web3.js `Contract` instance for the TokenLocker
//   contract at address `process.env.ethLockerAddress`
// * window.ethOnNearClient: similar to a near-api-js `Contract` instance, but
//   using a custom wrapper to handle Borsh serialization. See https://borsh.io
//   and the code in ./authNear.js. This will be streamlined and added to
//   near-api-js soon.
// * window.ethUserAddress: address of authenticated Ethereum wallet to send from
// * window.nearUserAddress: address of authenticated NEAR wallet to send to
export async function initiate ({ naturalErc20, nep21FromErc20, amount, callback }) {
  const originsProvided = [
    naturalErc20,
    nep21FromErc20
  ].reduce((n, arg) => n + Number(!!arg), 0)
  if (originsProvided !== 1) {
    throw new Error(`Please provide only one of:
      • naturalErc20: an address of a natural ERC20 to send to NEAR
      • nep21FromErc20: address of an NEP21 to send back to Ethereum
    `)
  }

  let customAttributes
  if (naturalErc20) {
    customAttributes = await naturalErc20ToNep21.initiate(naturalErc20, amount)
  }
  if (nep21FromErc20) {
    customAttributes = await bridgedNep21ToErc20.initiate(nep21FromErc20, amount)
  }

  const transfer = {
    amount,
    // currently hard-coding neededConfirmations until MintableFungibleToken is
    // updated with this information
    neededConfirmations: 10,
    ...customAttributes
  }

  track(transfer, callback)
}

// The only way to retrieve a list of transfers.
// Returns an object with 'inProgress' and 'complete' keys,
// and an array of chronologically-ordered transfers for each
export function get () {
  const raw = storage.getAll()
  return Object.keys(raw).sort().reduce(
    (acc, id) => {
      const transfer = raw[id]

      if (transfer.status === 'complete') acc.complete.push(transfer)
      else acc.inProgress.push(transfer)

      return acc
    },
    { inProgress: [], complete: [] }
  )
}

// Return a human-readable description of the status for a given transfer
export function humanStatusFor (transfer) {
  if (transfer.erc20Address) return naturalErc20ToNep21.humanStatusFor(transfer)
}

// Check statuses of all inProgress transfers, and update them accordingly.
// Accepts an optional callback, which will be called after all transfers have
// been checked & updated.
export async function checkStatuses (callback) {
  // First, check if we've just returned to this page from NEAR Wallet after
  // completing a transfer. Do this outside of main Promise.all to
  //
  //   1. avoid race conditions
  //   2. check retried failed transfers, which are not inProgress
  const id = urlParams.get('minting')
  if (id) {
    const transfer = storage.get(id)
    if (transfer && transfer.erc20Address) {
      await naturalErc20ToNep21.checkCompletion(transfer)
    }
    urlParams.clear('minting', 'balanceBefore')
    if (callback) await callback()
  }

  const { inProgress } = get()

  // if all transfers successful, nothing to do
  if (!inProgress.length) return

  // Check & update statuses for all in parallel.
  // Do not pass callback, only call it once after all updated.
  await Promise.all(inProgress.map(t => checkStatus(t.id)))

  if (callback) await callback()

  // recheck statuses again soon
  window.setTimeout(() => checkStatuses(callback), 5500)
}

// Retry a failed transfer
export async function retry (id, callback) {
  let transfer = storage.get(id)

  transfer = storage.update(transfer, {
    status: transfer.failedAt,
    outcome: null,
    error: null,
    failedAt: null
  })

  if (transfer.erc20Address) {
    await naturalErc20ToNep21.retry(transfer)
  }

  if (transfer.nep21FromErc20) {
    await bridgedNep21ToErc20.retry(transfer)
  }

  if (callback) await callback()
  checkStatus(id, callback)
}

// Clear a transfer from localStorage
export function clear (id) {
  storage.clear(id)
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates, which, if given a callback, will
// kick off timed re-checks.
async function track (transferRaw, callback) {
  const id = ulid()
  const transfer = { id, ...transferRaw }

  storage.add(transfer)

  if (callback) await callback()
  checkStatus(id, callback)
}

// check the status of a single transfer
// if `callback` is provided:
//   * it will be called after updating the status in localStorage
//   * a new call to checkStatus will be scheduled for this transfer, if its status is not SUCCESS
async function checkStatus (id, callback) {
  let transfer = storage.get(id)

  if (transfer.erc20Address) {
    transfer = await naturalErc20ToNep21.checkStatus(transfer)
  }

  // if successfully transfered, call callback and end
  if (transfer.status === COMPLETE) {
    if (callback) await callback()
    return
  }

  // if not fully transferred and callback passed in, check status again soon
  if (callback) {
    await callback()
    window.setTimeout(() => checkStatus(transfer.id, callback), 5500)
  }
}
