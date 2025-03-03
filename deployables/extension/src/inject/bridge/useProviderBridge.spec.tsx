import {
  chromeMock,
  createMockTab,
  mockActiveTab,
  MockProvider,
  mockProviderRequest,
  renderHook,
} from '@/test-utils'
import type { Eip1193Provider } from '@/types'
import { cleanup, waitFor } from '@testing-library/react'
import { ZERO_ADDRESS } from '@zodiac/chains'
import { InjectedProviderMessageTyp } from '@zodiac/messages'
import type { Hex } from '@zodiac/schema'
import { toQuantity } from 'ethers'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProvideBridgeContext } from './BridgeContext'
import { useProviderBridge } from './useProviderBridge'

describe('Bridge', () => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ProvideBridgeContext windowId={1}>{children}</ProvideBridgeContext>
  )

  afterEach(cleanup)

  describe('Provider handling', () => {
    it('relays requests to the provider', async () => {
      const provider = new MockProvider()

      await renderHook(() => useProviderBridge({ provider }), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      const request = { method: 'eth_chainId' }

      await mockProviderRequest({
        request,
        tab: createMockTab({ windowId: 1 }),
      })

      expect(provider.request).toHaveBeenCalledWith(request)
    })

    it('forwards the response from the provider', async () => {
      const provider = new MockProvider()

      const response = { data: 'test' }

      provider.request.mockResolvedValue(response)

      await renderHook(() => useProviderBridge({ provider }), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      const request = { method: 'eth_chainId' }

      const sendMessage = vi.fn()

      await mockProviderRequest({
        request,
        tab: createMockTab({ windowId: 1 }),
        callback: sendMessage,
      })

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_RESPONSE,
          response,
        }),
      )
    })

    it('catches and forwards errors from the provider', async () => {
      const provider = new MockProvider()

      const error = { message: 'Something went wrong', code: 666 }

      provider.request.mockRejectedValue(error)

      await renderHook(() => useProviderBridge({ provider }), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      const request = { method: 'eth_chainId' }

      const sendMessage = vi.fn()

      await mockProviderRequest({
        request,
        tab: createMockTab({ windowId: 1 }),
        callback: sendMessage,
      })

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_ERROR,
          error,
        }),
      )
    })

    it('only calls the current provider', async () => {
      const providerA = new MockProvider()
      const providerB = new MockProvider()

      const request = { method: 'eth_chainId' }

      const { rerender } = await renderHook(
        ({ provider }: { provider: Eip1193Provider }) =>
          useProviderBridge({ provider }),
        {
          initialProps: { provider: providerA },
          wrapper: Wrapper,
          activeTab: mockActiveTab({ windowId: 1 }),
        },
      )

      rerender({ provider: providerB })

      await mockProviderRequest({
        request,
        tab: createMockTab({ windowId: 1 }),
      })

      expect(providerA.request).not.toHaveBeenCalled()
      expect(providerB.request).toHaveBeenCalledWith(request)
    })
  })

  describe('Account handling', () => {
    const provider = new MockProvider()

    it('emits an "accountsChanged" event when the hook initially renders with an account', async () => {
      const tab = mockActiveTab()

      await renderHook(
        () => useProviderBridge({ provider, account: ZERO_ADDRESS }),
        { wrapper: Wrapper, activeTab: tab },
      )

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'accountsChanged',
          eventData: [ZERO_ADDRESS],
        })
      })
    })

    it('does not emit an "accountsChanged" event when there is no account on the first render', async () => {
      await renderHook(() => useProviderBridge({ provider }), {
        wrapper: Wrapper,
      })

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith()
    })

    it('does emit an "accountsChanged" event when the account resets on later renders', async () => {
      const tab = mockActiveTab()

      const { rerender } = await renderHook<void, { account: Hex | undefined }>(
        ({ account }) => useProviderBridge({ provider, account }),
        {
          initialProps: { account: ZERO_ADDRESS },
          wrapper: Wrapper,
          activeTab: tab,
        },
      )

      rerender({ account: undefined })

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'accountsChanged',
          eventData: [],
        })
      })
    })
  })

  describe('Chain handling', () => {
    const provider = new MockProvider()

    it('emits a "connect" event when the chainId is initially set', async () => {
      const tab = mockActiveTab()

      await renderHook(() => useProviderBridge({ provider, chainId: 1 }), {
        wrapper: Wrapper,
        activeTab: tab,
      })

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

      const { rerender } = await renderHook<void, { chainId: ChainId }>(
        ({ chainId }) => useProviderBridge({ provider, chainId }),
        { initialProps: { chainId: 1 }, wrapper: Wrapper, activeTab: tab },
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
