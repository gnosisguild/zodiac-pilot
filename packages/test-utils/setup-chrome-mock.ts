import { afterEach, beforeEach } from 'vitest'
import { chromeMock } from './src/chrome/chromeMock'
import { createStorageMock } from './src/chrome/storageMock'

beforeEach(() => {
  createStorageMock()
})

afterEach(() => {
  clearAllListeners()
})

Object.assign(global, { chrome: chromeMock })

const propertyDenyList = ['prototype', 'mock']

const clearAllListeners = (parent = chromeMock) => {
  Object.getOwnPropertyNames(parent).forEach((propertyName) => {
    // @ts-expect-error we're a bit generic here but that's fine
    const property = parent[propertyName]

    if (propertyDenyList.includes(propertyName)) {
      return
    }

    const supportsInOperator =
      typeof property !== 'number' &&
      typeof property !== 'string' &&
      typeof property !== 'boolean' &&
      typeof property !== 'undefined'

    if (supportsInOperator) {
      if ('clearListeners' in property) {
        property.clearListeners()
      }

      clearAllListeners(property)
    }
  })
}
