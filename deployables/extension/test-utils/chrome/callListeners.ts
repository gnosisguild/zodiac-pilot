import { sleepTillIdle } from '@/utils'
import type { EventCallback } from 'vitest-chrome/event-types'
import type { Events } from 'vitest-chrome/types'

export const callListeners = async <
  C extends EventCallback,
  T extends Events.Event<C>,
>(
  event: T,
  ...args: Parameters<T['callListeners']>
) => {
  const result = event.callListeners(...args)

  await sleepTillIdle()

  return result
}
