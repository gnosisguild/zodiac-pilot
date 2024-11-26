import { ETH_ZERO_ADDRESS } from '@/chains'
import { createMockRoute, renderHook } from '@/test-utils'
import { ProviderType } from '@/types'
import { sleep } from '@/utils'
import { describe, expect, it, vi } from 'vitest'
import { useDisconnectWalletConnectIfNeeded } from './useDisconnectWalletConnectIfNeeded'
import { getWalletConnectProvider } from './useWalletConnectProvider'

describe('Disconnect Wallet Connect if needed', () => {
  it('removes the piloted address from the route when the provider disconnects', async () => {
    const route = createMockRoute({
      providerType: ProviderType.WalletConnect,
      avatar: ETH_ZERO_ADDRESS,
    })

    const onDisconnect = vi.fn()

    await renderHook(
      () => useDisconnectWalletConnectIfNeeded(route, { onDisconnect }),
      {
        routes: [route],
      }
    )

    const provider = await getWalletConnectProvider(route.id)

    // Finish the event loop once so that all listeners could be
    // set up
    await sleep(1)

    provider.events.emit('disconnect')

    expect(onDisconnect).toHaveBeenCalled()
  })

  it('does not call "onDisconnect" after the hook unmounts', async () => {
    const route = createMockRoute({
      providerType: ProviderType.WalletConnect,
      avatar: ETH_ZERO_ADDRESS,
    })

    const onDisconnect = vi.fn()

    const { unmount } = await renderHook(
      () => useDisconnectWalletConnectIfNeeded(route, { onDisconnect }),
      {
        routes: [route],
      }
    )

    const provider = await getWalletConnectProvider(route.id)

    // Finish the event loop once so that all listeners could be
    // set up
    await sleep(1)

    unmount()

    provider.events.emit('disconnect')

    expect(onDisconnect).not.toHaveBeenCalled()
  })

  it('always calls the latest callback', async () => {
    const route = createMockRoute({
      providerType: ProviderType.WalletConnect,
      avatar: ETH_ZERO_ADDRESS,
    })

    const firstOnDisconnect = vi.fn()
    const secondOnDisconnect = vi.fn()

    const { rerender } = await renderHook(
      ({ onDisconnect }) =>
        useDisconnectWalletConnectIfNeeded(route, { onDisconnect }),
      {
        routes: [route],
        initialProps: {
          onDisconnect: firstOnDisconnect,
        },
      }
    )

    const provider = await getWalletConnectProvider(route.id)

    // Finish the event loop once so that all listeners could be
    // set up
    await sleep(1)

    rerender({ onDisconnect: secondOnDisconnect })

    provider.events.emit('disconnect')

    expect(firstOnDisconnect).not.toHaveBeenCalled()
    expect(secondOnDisconnect).toHaveBeenCalled()
  })
})
