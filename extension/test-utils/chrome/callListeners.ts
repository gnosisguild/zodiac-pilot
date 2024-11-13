import { EventCallback } from 'vitest-chrome/types/create-event'
import { Events } from 'vitest-chrome/types/vitest-chrome'

export const callListeners = async <
  C extends EventCallback,
  T extends Events.Event<C>,
>(
  event: T,
  ...args: Parameters<T['callListeners']>
) => {
  return event.callListeners(...args)
}
