export type EventFn = (...args: any) => void

type DisposeFn = () => void

export type Event<T extends EventFn = () => void> = {
  addListener: (listener: T) => DisposeFn
  removeListener: (listener: T) => void
  removeAllListeners: () => void
}

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
