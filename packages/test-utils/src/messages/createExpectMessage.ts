import { waitFor } from '@testing-library/react'
import { expect } from 'vitest'

export function createExpectMessage<T>() {
  return (message: T) =>
    waitFor(() => {
      expect(window.postMessage).toHaveBeenCalledWith(message, '*')
    })
}
