import { vi } from 'vitest'

export const mockRoute = (routeId: string) => {
  const mockGet = vi.mocked(chrome.storage.sync.get)

  mockGet.mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      return callback({ [routeId]: {} })
    }

    return null
  })
}
