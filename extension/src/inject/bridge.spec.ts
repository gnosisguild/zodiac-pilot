import { InjectedProviderMessage, InjectedProviderMessageTyp } from '@/messages'
import { callListeners, chromeMock, mockActiveTab } from '@/test-utils'
import { Eip1193Provider } from '@/types'
import { cleanup, renderHook } from '@testing-library/react'
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
  describe('Provider handling', () => {
    class MockProvider implements Eip1193Provider {
      request: MockedFunction<Eip1193Provider['request']>

      on = vi.fn()
      removeListener = vi.fn()

      constructor() {
        this.request = vi.fn().mockResolvedValue(null)
      }
    }

    beforeEach(() => {
      mockActiveTab()
    })

    afterEach(cleanup)

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

  describe('Account handling', () => {})

  describe('Chain handling', () => {})
})
