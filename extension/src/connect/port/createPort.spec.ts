import { ConnectedWalletMessage, ConnectedWalletMessageType } from '@/messages'
import { createMockPort, mockTabConnect } from '@/test-utils'
import { invariant } from '@epic-web/invariant'
import { describe, expect, it, vi } from 'vitest'
import { createPort } from './createPort'

describe('Create port', () => {
  it.each(['chrome://extension', 'about://blank'])(
    'does nothing for URL "%s',
    async (url) => {
      await expect(createPort(1, url)).resolves.toBeNull()
    }
  )

  it('resolves to the port when it received the initialize message', async () => {
    vi.useFakeTimers()

    const port = createMockPort()

    mockTabConnect(port)

    const { promise, resolve } = Promise.withResolvers<void>()

    createPort(1, 'http://test.com').then((createdPort) => {
      expect(createdPort).toEqual(port)

      resolve()
    })

    port.onMessage.callListeners(
      {
        type: ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED,
      } satisfies ConnectedWalletMessage,
      port
    )

    await vi.runAllTimersAsync()

    port.onMessage.callListeners(
      {
        type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED,
      } satisfies ConnectedWalletMessage,
      port
    )

    return promise
  })

  it('tries to open a new port, when the connection is not acknowledged after 500ms', async () => {
    vi.useFakeTimers()

    let portNumber = 1

    const portRef = mockTabConnect(() =>
      createMockPort({ name: `port-${portNumber++}` })
    )

    const { promise, resolve } = Promise.withResolvers<void>()

    createPort(1, 'http://test.com').then((createdPort) => {
      expect(createdPort).toHaveProperty('name', 'port-2')

      resolve()
    })

    vi.advanceTimersByTime(600)

    const port = portRef.current

    invariant(port != null, 'Not port was created')

    port.onMessage.callListeners(
      {
        type: ConnectedWalletMessageType.CONNECTED_WALLET_CONNECTED,
      } satisfies ConnectedWalletMessage,
      port
    )

    await vi.runAllTimersAsync()

    port.onMessage.callListeners(
      {
        type: ConnectedWalletMessageType.CONNECTED_WALLET_INITIALIZED,
      } satisfies ConnectedWalletMessage,
      port
    )

    return promise
  })
})
