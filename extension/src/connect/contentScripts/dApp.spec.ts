import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { chromeMock, createMockPort } from '@/test-utils'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Connect Pilot to DApp', () => {
  describe('Initialize wallet', () => {
    it('forwards init messages to the connected port', async () => {
      await import('./dApp')

      const port = createMockPort()

      chromeMock.runtime.onConnect.callListeners(port)

      const message = {
        type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED,
      } satisfies ConnectedWalletMessage

      window.postMessage(message)

      await waitFor(() => {
        expect(port.postMessage).toHaveBeenCalledWith(message)
      })
    })
  })
})
