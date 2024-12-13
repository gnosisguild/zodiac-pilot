import { chromeMock } from './chromeMock'

export const createStorageMock = () => {
  const data = new Map<string, unknown>()

  chromeMock.storage.sync.get.mockImplementation(async (callbackOrKey) => {
    if (typeof callbackOrKey === 'function') {
      return callbackOrKey(Object.fromEntries(data.entries()))
    }

    if (typeof callbackOrKey === 'string') {
      return { [callbackOrKey]: data.get(callbackOrKey) }
    }

    return null
  })

  chromeMock.storage.sync.set.mockImplementation((entries) => {
    Object.entries(entries).forEach(([key, value]) => {
      data.set(key, value)
    })
  })

  chromeMock.storage.sync.remove.mockImplementation((key) => {
    if (typeof key === 'string') {
      data.delete(key)
    }
  })
}
