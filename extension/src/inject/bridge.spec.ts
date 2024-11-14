import { InjectedProviderMessage, InjectedProviderMessageTyp } from '@/messages'
import { callListeners, chromeMock, mockActiveTab } from '@/test-utils'
import { Eip1193Provider } from '@/types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProviderBridge } from './bridge'

describe('Bridge', () => {
  describe('Provider handling', () => {
    class MockProvider implements Eip1193Provider {
      request = vi.fn().mockResolvedValue(null)
      on = vi.fn()
      removeListener = vi.fn()
    }

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
  })

  describe('Account handling', () => {})

  describe('Chain handling', () => {})
})
