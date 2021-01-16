import * as naturalErc20ToNep21 from './erc20+nep21/natural-erc20-to-nep21'
import * as urlParams from '../urlParams'
import * as storage from './storage'
import * as status from './statuses'

export { onChange } from './storage'

function dashToCamelCase (str) {
  return str.replace(/-./g, match =>
    match.toUpperCase().replace('-', '')
  )
}

// The only way to retrieve a list of transfers.
// Returns an object with keys for each transfer status plus 'all',
// with array of chronologically-ordered transfers for each
export async function get () {
  const transfers = await storage.getAll()
  return transfers.reduce(
    (acc, transfer) => {
      const status = dashToCamelCase(transfer.status)
      acc[status].push(transfer)
      acc.all.push(transfer)
      return acc
    },
    { all: [], inProgress: [], actionNeeded: [], failed: [], complete: [] }
  )
}

/*
 * Decorate a transfer with human- and app-friendly attributes.
 *
 * For storage efficiency, raw transfers don't include various attributes. This
 * returns a new object with all original attributes of provided `transfer`,
 * and also adds:
 *
 * - sourceNetwork: either 'ethereum' or 'near'
 * - destinationNetwork: either 'near' or 'ethereum'
 * - error: if status === 'failed', gets set to most recent error encountered
 *     by transfer (raw transfer has `errors` key which stores all errors
 *     encountered throughout life of transfer)
 * - steps: array, with each entry of the form `{ key: String, status:
 *     'pending' | 'complete' | 'failed', description: i18n'd String }`
 * - statusMessage: i18n'd present-tense version of in-progress step, or
 *     "Failed" if transfer.status === 'failed' (check transfer.error for error
 *     message)
 * - callToAction: something like 'Mint' or 'Confirm'; only added if
 *     transfer.status === 'action-needed'
 *
 * If you provide no `locale` or one unsupported by the underlying transfer
 * type, the transfer type's first locale will be used.
 */
export function decorate (transfer, { locale } = {}) {
  const type = getTransferType(transfer)

  let localized = type.i18n[locale]
  if (!localized) {
    const availableLocales = Object.keys(type.i18n)
    const fallback = availableLocales[0]
    if (locale) {
      console.warn(
        `Requested locale ${locale} not available for ${transfer.type
        }. Available locales: \n\n  • ${availableLocales.join('\n  • ')
        }\n\nFalling back to ${fallback}`
      )
    }
    localized = type.i18n[fallback]
  }

  const decorated = { ...transfer }
  decorated.sourceNetwork = type.SOURCE_NETWORK
  decorated.destinationNetwork = type.DESTINATION_NETWORK
  decorated.error = transfer.status === status.FAILED &&
    transfer.errors[transfer.errors.length - 1]
  decorated.steps = localized.steps(transfer)
  decorated.statusMessage = localized.statusMessage(transfer)
  decorated.callToAction = localized.callToAction(transfer)

  return decorated
}

/*
 * Check statuses of all inProgress transfers, and update them accordingly.
 *
 * Can provide a `loop` frequency, in milliseconds, to call repeatedly while
 * inProgress transfers remain
 */
export async function checkStatusAll ({ loop } = {}) {
  checkIsInt({ loop, error: 'must be frequency, in milliseconds' })

  // First, check if we've just returned to this page from NEAR Wallet after
  // completing a transfer. Do this outside of main Promise.all to
  //
  //   1. avoid race conditions
  //   2. check retried failed transfers, which are not inProgress
  const id = urlParams.get('minting')
  if (id) {
    const transfer = await storage.get(id)
    if (transfer && transfer.type === '@eth+near/erc20+nep21/natural-erc20-to-nep21') {
      storage.update(await naturalErc20ToNep21.checkCompletion(transfer))
    }
    urlParams.clear('minting', 'balanceBefore')
  }

  const { inProgress } = await get()

  // if all transfers successful, nothing to do
  if (!inProgress.length) return

  // Check & update statuses for all in parallel
  await Promise.all(inProgress.map(t => checkStatus(t.id)))

  // loop, if told to loop
  if (loop) window.setTimeout(() => checkStatusAll({ loop }), loop)
}

/*
 * Act on a transfer! That is, start whatever comes next.
 *
 * If a transfer step requires user confirmation before proceeding, this gets
 * called when the user confirms they're ready. Whatever next action is
 * appropriate for the transfer with given id, this will take it.
 *
 * If the transfer failed, this will retry it.
 */
export async function act (id) {
  const transfer = await storage.get(id)
  if (![status.FAILED, status.ACTION_NEEDED].includes(transfer.status)) {
    console.warn('No action needed for transfer with status', transfer.status)
    return
  }
  const type = getTransferType(transfer)

  try {
    storage.update(await type.act(transfer))
  } catch (error) {
    await storage.update(transfer, {
      status: status.FAILED,
      errors: [...transfer.errors, error.message]
    })
  }
}

// Clear a transfer from localStorage
export async function clear (id) {
  await storage.clear(id)
}

// Add a new transfer to the set of cached local transfers.
// This transfer will be given a chronologically-ordered id.
// This transfer will be checked for updates on a loop.
export async function track (transferRaw, { checkStatusEvery }) {
  checkIsInt({ checkStatusEvery, error: 'must be frequency, in milliseconds' })
  const id = new Date().toISOString()
  const transfer = { id, ...transferRaw }

  await storage.add(transfer)

  if (checkStatusEvery) checkStatus(id, { loop: checkStatusEvery })

  return transfer
}

// Check the status of a single transfer.
// If `loop` is provided, a new call to checkStatus will be scheduled for this
// transfer, if transfer.status is not COMPLETE.
async function checkStatus (id, { loop } = {}) {
  checkIsInt({ loop, error: 'must be frequency, in milliseconds' })

  let transfer = await storage.get(id)
  const type = getTransferType(transfer)

  // only in-progress transfers need to be checked on
  if (transfer.status === status.IN_PROGRESS) {
    try {
      transfer = await type.checkStatus(transfer)
      await storage.update(transfer)
    } catch (e) {
      await storage.update(transfer, {
        status: status.FAILED,
        errors: [...transfer.errors, e.message]
      })
    }
  }

  // if not fully transferred and told to loop, check status again soon
  if (loop && transfer.status !== status.COMPLETE) {
    window.setTimeout(() => checkStatus(id, { loop }), loop)
  }
}

function getTransferType (transfer) {
  try {
    return require(transfer.type)
  } catch (depLoadError) {
    try {
      return require(`./${transfer.type.split('/').slice(-2).join('/')}`)
    } catch (localLoadError) {
      console.error(depLoadError)
      console.error(localLoadError)
      throw new Error(`Can't determine type for transfer: ${JSON.stringify(transfer)}`)
    }
  }
}

function checkIsInt ({ error = 'must be integer', ...attrs }) {
  Object.keys(attrs).forEach(key => {
    if (attrs[key] && !Number.isInteger(attrs[key])) {
      throw new Error(`\`${key}\` ${error}`)
    }
  })
}
