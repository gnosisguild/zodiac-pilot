import type { Event, EventFn } from './types'

type EventListener<C extends EventFn> = {
  callListeners: (...args: Parameters<C>) => void
  toEvent: () => Event<C>
}

export const createEventListener = <
  T extends EventFn = () => void,
>(): EventListener<T> => {
  const listeners = new Set<T>()

  return {
    callListeners: (...args) =>
      listeners.forEach((listener) => listener(...args)),
    toEvent() {
      return {
        addListener(listener) {
          listeners.add(listener)

          return () => {
            listeners.delete(listener)
          }
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
