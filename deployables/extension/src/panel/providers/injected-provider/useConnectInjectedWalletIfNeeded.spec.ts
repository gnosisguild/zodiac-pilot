import {
  createMockRoute,
  MockProvider,
  renderHook,
  RenderWrapper,
} from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useInjectedWallet } from './InjectedWalletContext'
import { useConnectInjectedWalletIfNeeded } from './useConnectInjectedWalletIfNeeded'

vi.mock(import('./InjectedWalletContext'), async (importOriginal) => {
  const module = await importOriginal()

  return {
    ...module,

    useInjectedWallet: vi.fn(),
  }
})

const mockUseInjectedWallet = vi.mocked(useInjectedWallet)

describe('Connect injected wallet if needed', async () => {
  it('does not connect the injected wallet when the connection status is "error"', async () => {
    const connect = vi.fn()

    const route = createMockRoute()

    mockUseInjectedWallet.mockReturnValue({
      accounts: [],
      chainId: null,
      connect,
      ready: true,
      provider: new MockProvider(),
      switchChain: vi.fn(),
      connectionStatus: 'error',
    })

    await renderHook(() => useConnectInjectedWalletIfNeeded(), {
      wrapper: RenderWrapper,
      routes: [route],
    })

    expect(connect).not.toHaveBeenCalled()
  })

  it('does not connect the injected wallet when the connection is not ready', async () => {
    const connect = vi.fn()

    const route = createMockRoute()

    mockUseInjectedWallet.mockReturnValue({
      accounts: [],
      chainId: null,
      connect,
      ready: false,
      provider: new MockProvider(),
      switchChain: vi.fn(),
      connectionStatus: 'disconnected',
    })

    await renderHook(() => useConnectInjectedWalletIfNeeded(), {
      wrapper: RenderWrapper,
      routes: [route],
    })

    expect(connect).not.toHaveBeenCalled()
  })

  it('does not connect the injected wallet when it is already connected', async () => {
    const connect = vi.fn()

    const route = createMockRoute()

    mockUseInjectedWallet.mockReturnValue({
      accounts: [],
      chainId: null,
      connect,
      ready: false,
      provider: new MockProvider(),
      switchChain: vi.fn(),
      connectionStatus: 'connected',
    })

    await renderHook(() => useConnectInjectedWalletIfNeeded(), {
      wrapper: RenderWrapper,
      routes: [route],
    })

    expect(connect).not.toHaveBeenCalled()
  })

  it('does not connect the injected wallet when it is already connecting', async () => {
    const connect = vi.fn()

    const route = createMockRoute()

    mockUseInjectedWallet.mockReturnValue({
      accounts: [],
      chainId: null,
      connect,
      ready: false,
      provider: new MockProvider(),
      switchChain: vi.fn(),
      connectionStatus: 'connecting',
    })

    await renderHook(() => useConnectInjectedWalletIfNeeded(), {
      wrapper: RenderWrapper,
      routes: [route],
    })

    expect(connect).not.toHaveBeenCalled()
  })
})
