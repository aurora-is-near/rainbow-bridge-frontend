import * as localStorage from './localStorage'
import { ulid } from 'ulid'

function getKey () {
  return `${window.ethUserAddress}-to-${window.nearUserAddress}`
}

function getRaw () {
  return localStorage.get(getKey()) || {}
}

// return an array of chronologically-ordered transfers
export function get () {
  const raw = getRaw()
  return Object.keys(raw).sort().map(id => raw[id])
}

const INITIATED = 'initiated'
const CROSSING = 'crossing'
const SUCCESS = 'success'

const statusMessages = {
  [INITIATED]: () => 'awaiting Locked event',
  [CROSSING]: (progress) => `${progress}/25 blocks synced`,
  [SUCCESS]: () => 'succeeded'
}

export function humanStatusFor (transfer) {
  return statusMessages[transfer.status](transfer.progress)
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates after a pause.
function track (transferRaw, callback) {
  const id = ulid()
  const transfer = { id, ...transferRaw }

  localStorage.set(getKey(), { ...getRaw(), [id]: transfer })

  // check status again after a pause
  window.setTimeout(() => checkStatus(transfer, callback), 10000)
}

function update (transfer, withData) {
  const current = getRaw()
  localStorage.set(getKey(), {
    ...current,
    [transfer.id]: { ...transfer, ...withData }
  })
}

export async function initiate (amount, callback) {
  await window.erc20.approve(process.env.ethLockerAddress, amount)
  const initiateLock = await window.tokenLocker.lockToken(amount, window.nearUserAddress)

  track({ amount, initiateLock, status: INITIATED }, callback)
}

async function checkStatus (transfer, callback) {
  if (transfer.status === INITIATED) {
    // TODO: find a way to query tokenLocker for single desired event, not all Locked events
    const allLockedEvents = await window.tokenLocker.queryFilter('Locked')

    const lockedEvent = allLockedEvents.find(event =>
      event.transactionHash === transfer.initiateLock.hash
    )

    if (lockedEvent) {
      update(transfer, { status: CROSSING, progress: 0, lockedEvent })
    }
  }

  if (callback) await callback()
}

export async function checkStatuses (callback) {
  const inFlight = get().filter(t => t.status !== SUCCESS)

  // if all transfers successful, nothing to do
  if (!inFlight.length) return

  // Check statuses for all in parallel.
  // Do not pass callback, only call it once after all updated.
  await Promise.all(inFlight.map(t => checkStatus(t)))

  if (callback) await callback()

  // recheck status again soon
  window.setTimeout(() => checkStatuses(callback), 15000)
}
