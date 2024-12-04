import { Event, EventFn } from './types'

type EventListener<C extends EventFn> = {
  callListeners: (...args: Parameters<C>) => void
  toEvent: () => Event<C>
}

export const createEventListener = <
  T extends EventFn = () => void,
>(): EventListener<T> => {
  const listeners = new Set<T>()

  return {
    callListeners: () => listeners.forEach((listener) => listener()),
    toEvent() {
      return {
        addListener(listener) {
          listeners.add(listener)
        },
        removeAllListeners() {
          listeners.clear()
        },
        removeListener(listener) {
          listeners.delete(listener)
        },
      }
    },
  }
}
