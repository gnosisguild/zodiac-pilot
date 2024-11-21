import { useInjectedWallet } from '@/providers'
import {
  createMockRoute,
  MockProvider,
  renderHook,
  RenderWrapper,
} from '@/test-utils'
import { ProviderType } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { useConnectInjectedWalletIfNeeded } from './useConnectInjectedWalletIfNeeded'

vi.mock(import('@/providers'), async (importOriginal) => {
  const providersModule = await importOriginal()

  return {
    ...providersModule,

    useInjectedWallet: vi.fn(),
  }
})

const mockUseInjectedWallet = vi.mocked(useInjectedWallet)

describe('Connect injected wallet if needed', async () => {
  it('does not connect the injected wallet when the connection status is "error"', async () => {
    const connect = vi.fn()

    const route = createMockRoute({ providerType: ProviderType.InjectedWallet })

    mockUseInjectedWallet.mockReturnValue({
      accounts: [],
      chainId: null,
      connect,
      connected: true,
      connecting: false,
      provider: new MockProvider(),
      switchChain: vi.fn(),
      connectionStatus: 'error',
    })

    await renderHook(() => useConnectInjectedWalletIfNeeded(route), {
      wrapper: RenderWrapper,
      routes: [route],
    })

    expect(connect).not.toHaveBeenCalled()
  })
})
