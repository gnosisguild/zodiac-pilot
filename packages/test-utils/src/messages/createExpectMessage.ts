import { waitFor } from '@testing-library/react'

export async function createExpectMessage<T>() {
  // This is needed to ensure compatibility with playwright
  const { expect } = await import('vitest')

  return (message: T) =>
    waitFor(() => {
      expect(window.postMessage).toHaveBeenCalledWith(message, '*')
    })
}
