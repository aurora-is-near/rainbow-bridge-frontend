import { FAILED } from './statuses'

export function stepsFor (transfer, steps, descriptions) {
  const completed = steps.indexOf(transfer.completedStep)
  return steps.map((key, i) => ({
    key,
    description: descriptions[key],
    status: transfer.status === FAILED && i === completed + 1
      ? FAILED
      : i <= completed ? 'completed' : 'pending'
  }))
}
