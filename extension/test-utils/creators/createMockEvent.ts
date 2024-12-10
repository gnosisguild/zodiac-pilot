import type { EventCallback } from 'vitest-chrome/types/create-event'
import type { VitestChromeNamespace } from 'vitest-chrome/types/vitest-chrome'

export const createMockEvent = <
  T extends EventCallback,
>(): VitestChromeNamespace.events.Event<T> => {
  const listeners = new Set<T>()

  return {
    addListener: (callback) => listeners.add(callback),
    hasListener: (callback) => listeners.has(callback),
    hasListeners: () => listeners.size > 0,
    removeListener: (callback) => listeners.delete(callback),

    callListeners: (...args) =>
      listeners.forEach((listener) => listener(...args)),
    clearListeners: () => listeners.clear(),
    getListeners: () => listeners,
    toEvent: () => {
      throw new Error('Not implemented')
    },
  }
}
