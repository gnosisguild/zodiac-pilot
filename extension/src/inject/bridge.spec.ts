import { ZERO_ADDRESS } from '@/chains'
import { InjectedProviderMessage, InjectedProviderMessageTyp } from '@/messages'
import { callListeners, chromeMock, mockActiveTab } from '@/test-utils'
import { Eip1193Provider } from '@/types'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { toQuantity } from 'ethers'
import { ChainId } from 'ser-kit'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockedFunction,
  vi,
} from 'vitest'
import { useProviderBridge } from './bridge'

describe('Bridge', () => {
  class MockProvider implements Eip1193Provider {
    request: MockedFunction<Eip1193Provider['request']>

    on = vi.fn()
    removeListener = vi.fn()

    constructor() {
      this.request = vi.fn().mockResolvedValue(null)
    }
  }

  afterEach(cleanup)

  describe('Provider handling', () => {
    beforeEach(() => {
      mockActiveTab()
    })

    it('relays requests to the provider', async () => {
      const provider = new MockProvider()

      renderHook(() => useProviderBridge({ provider }))

      const request = { method: 'eth_chainId' }

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          request,
          requestId: 'test-id',
        } satisfies InjectedProviderMessage,
        { id: chromeMock.runtime.id },
        vi.fn()
      )

      expect(provider.request).toHaveBeenCalledWith(request)
    })

    it('forwards the response from the provider', async () => {
      const provider = new MockProvider()

      const response = { data: 'test' }

      provider.request.mockResolvedValue(response)

      renderHook(() => useProviderBridge({ provider }))

      const request = { method: 'eth_chainId' }

      const sendMessage = vi.fn()

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          request,
          requestId: 'test-id',
        } satisfies InjectedProviderMessage,
        { id: chromeMock.runtime.id },
        sendMessage
      )

      expect(sendMessage).toHaveBeenCalledWith({
        type: InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE,
        response,
        requestId: 'test-id',
      })
    })

    it('catches and forwards errors from the provider', async () => {
      const provider = new MockProvider()

      const error = { message: 'Something went wrong', code: 666 }

      provider.request.mockRejectedValue(error)

      renderHook(() => useProviderBridge({ provider }))

      const request = { method: 'eth_chainId' }

      const sendMessage = vi.fn()

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          request,
          requestId: 'test-id',
        } satisfies InjectedProviderMessage,
        { id: chromeMock.runtime.id },
        sendMessage
      )

      expect(sendMessage).toHaveBeenCalledWith({
        type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR,
        requestId: 'test-id',
        error,
      })
    })

    it('only calls the current provider', async () => {
      const providerA = new MockProvider()
      const providerB = new MockProvider()

      const request = { method: 'eth_chainId' }

      const { rerender } = renderHook(
        ({ provider }: { provider: Eip1193Provider }) =>
          useProviderBridge({ provider }),
        { initialProps: { provider: providerA } }
      )

      rerender({ provider: providerB })

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          request,
          requestId: 'test-id',
        } satisfies InjectedProviderMessage,
        { id: chromeMock.runtime.id },
        vi.fn()
      )

      expect(providerA.request).not.toHaveBeenCalled()
      expect(providerB.request).toHaveBeenCalledWith(request)
    })
  })

  describe('Account handling', () => {
    const provider = new MockProvider()

    it('emits an "accountsChanged" event when the hook initially renders with an account', async () => {
      const tab = mockActiveTab()

      renderHook(() => useProviderBridge({ provider, account: ZERO_ADDRESS }))

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'accountsChanged',
          eventData: [ZERO_ADDRESS],
        })
      })
    })

    it('does not emit an "accountsChanged" event when there is no account on the first render', async () => {
      mockActiveTab()

      renderHook(() => useProviderBridge({ provider }))

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith()
    })

    it('does emit an "accountsChanged" event when the account resets on later renders', async () => {
      const tab = mockActiveTab()

      const { rerender } = renderHook<
        void,
        { account: `0x${string}` | undefined }
      >(({ account }) => useProviderBridge({ provider, account }), {
        initialProps: { account: ZERO_ADDRESS },
      })

      rerender({ account: undefined })

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'accountsChanged',
          eventData: [],
        })
      })

      renderHook(() => useProviderBridge({ provider }))

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith()
    })
  })

  describe('Chain handling', () => {
    const provider = new MockProvider()

    it('emits a "connect" event when the chainId is initially set', async () => {
      const tab = mockActiveTab()

      renderHook(() => useProviderBridge({ provider, chainId: 1 }))

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'connect',
          eventData: { chainId: toQuantity(1) },
        })
      })
    })

    it('emits a "chainChanged" event when the chain changes on a later render', async () => {
      const tab = mockActiveTab()

      const { rerender } = renderHook<void, { chainId: ChainId }>(
        ({ chainId }) => useProviderBridge({ provider, chainId }),
        { initialProps: { chainId: 1 } }
      )

      rerender({ chainId: 10 })

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'chainChanged',
          eventData: [toQuantity(10)],
        })
      })
    })
  })
})
