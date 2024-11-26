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
})
