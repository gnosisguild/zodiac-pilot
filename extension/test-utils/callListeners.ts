import {
  CallableEvent,
  EventCallback,
  MonotypeEventSelector,
} from 'vitest-chrome/types/create-event'

export const callListeners = async <
  C extends EventCallback,
  R extends MonotypeEventSelector<C>,
  T extends CallableEvent<C, R>,
>(
  event: T,
  ...args: Parameters<T['callListeners']>
) => {
  // @ts-expect-error in a very edge-case this could be wrong
  // but since we're talking about a test utility here I don't
  // give a crap
  return event.callListeners(...args)
}
