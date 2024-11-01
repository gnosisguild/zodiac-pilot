import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { createMockPort, mockActiveTab, mockTabConnect } from '@/test-utils'
import { describe, it } from 'vitest'
import { createPortOnTabActivity } from './createPortOnTabActivity'

describe('Port creation', () => {
  describe('Default', () => {
    it('tries to connect to the current tab by default', async () => {
      mockActiveTab({ url: 'http://test.com', status: 'complete' })

      const port = createMockPort()

      mockTabConnect(port)

      const { promise, resolve } = Promise.withResolvers<void>()

      createPortOnTabActivity((tabId, port) => {
        resolve()
      })

      port.onMessage.callListeners(
        {
          type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED,
        } satisfies ConnectedWalletMessage,
        port
      )

      return promise
    })
  })

  describe('Tab becomes active', () => {})

  describe('Tab updates', () => {})
})
