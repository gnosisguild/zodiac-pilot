import { afterEach, beforeEach } from 'vitest'
import { chromeMock } from './test-utils/chrome/chromeMock'
import { createStorageMock } from './test-utils/chrome/storageMock'

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
