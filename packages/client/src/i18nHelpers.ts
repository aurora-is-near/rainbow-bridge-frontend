import { FAILED } from './statuses'
import { Transfer, Step } from './types'

export function stepsFor (
  transfer: Transfer,
  steps: string[],
  descriptions: { [key: string]: string }
): Step[] {
  const completed = steps.indexOf(String(transfer.completedStep))
  return steps.map((key, i) => ({
    key,
    description: descriptions[key],
    status: transfer.status === FAILED && i === completed + 1
      ? FAILED
      : i <= completed ? 'completed' : 'pending'
  }))
}
