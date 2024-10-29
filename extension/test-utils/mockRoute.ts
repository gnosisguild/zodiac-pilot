import { vi } from 'vitest'

const mockGet = vi.mocked(chrome.storage.sync.get)

export const mockRoute = (routeId: string) => {
  mockGet.mockImplementation(async (callback) => {
    if (typeof callback === 'function') {
      return callback({ [routeId]: {} })
    }

    return null
  })
}
