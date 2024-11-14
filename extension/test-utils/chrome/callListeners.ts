import { sleep } from '@/utils'
import { EventCallback } from 'vitest-chrome/types/create-event'
import { Events } from 'vitest-chrome/types/vitest-chrome'

export const callListeners = async <
  C extends EventCallback,
  T extends Events.Event<C>,
>(
  event: T,
  ...args: Parameters<T['callListeners']>
) => {
  const result = event.callListeners(...args)

  // flush the event loop
  await sleep(1)

  return result
}
