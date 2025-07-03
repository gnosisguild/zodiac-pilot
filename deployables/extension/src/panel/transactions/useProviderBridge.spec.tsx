import { ProvideAccount, toRemoteAccount } from '@/accounts'
import { ProvideBridgeContext } from '@/port-handling'
import {
  chromeMock,
  createMockTab,
  mockActiveTab,
  mockProviderRequest,
  renderHook,
} from '@/test-utils'
import { cleanup, waitFor } from '@testing-library/react'
import { ZERO_ADDRESS } from '@zodiac/chains'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { InjectedProviderMessageTyp } from '@zodiac/messages'
import type { Hex } from '@zodiac/schema'
import { toQuantity } from 'ethers'
import type { PropsWithChildren } from 'react'
import type { ChainId } from 'ser-kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MockProvider } from './MockProvider'
import { ProvideProvider } from './ProvideProvider'
import { useProviderBridge } from './useProviderBridge'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  const { MockProvider } =
    await vi.importActual<typeof import('./MockProvider')>('./MockProvider')

  return {
    ...module,

    ForkProvider: MockProvider,
  }
})

describe('Bridge', () => {
  const Wrapper = ({ children }: PropsWithChildren) => {
    const user = userFactory.createWithoutDb()
    const tenant = tenantFactory.createWithoutDb(user)

    return (
      <ProvideAccount
        account={toRemoteAccount(accountFactory.createWithoutDb(tenant, user))}
      >
        <ProvideProvider>
          <ProvideBridgeContext windowId={1}>{children}</ProvideBridgeContext>
        </ProvideProvider>
      </ProvideAccount>
    )
  }

  afterEach(cleanup)

  describe('Provider handling', () => {
    it('relays requests to the provider', async () => {
      await renderHook(() => useProviderBridge(), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      const request = { method: 'eth_chainId' }

      await mockProviderRequest({
        request,
        tab: createMockTab({ windowId: 1 }),
      })

      expect(MockProvider.getInstance().request).toHaveBeenCalledWith(
        request,
        expect.anything(),
      )
    })

    it('forwards the response from the provider', async () => {
      const response = { data: 'test' }

      await renderHook(() => useProviderBridge(), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      MockProvider.getInstance().request.mockResolvedValue(response)

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
      const error = { message: 'Something went wrong', code: 666 }

      await renderHook(() => useProviderBridge(), {
        wrapper: Wrapper,
        activeTab: mockActiveTab({ windowId: 1 }),
      })

      MockProvider.getInstance().request.mockRejectedValue(error)

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
  })

  describe('Account handling', () => {
    it('emits an "accountsChanged" event when the hook initially renders with an account', async () => {
      const tab = mockActiveTab()

      await renderHook(() => useProviderBridge({ account: ZERO_ADDRESS }), {
        wrapper: Wrapper,
        activeTab: tab,
      })

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_EVENT,
          eventName: 'accountsChanged',
          eventData: [ZERO_ADDRESS],
        })
      })
    })

    it('does not emit an "accountsChanged" event when there is no account on the first render', async () => {
      await renderHook(() => useProviderBridge(), {
        wrapper: Wrapper,
      })

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith()
    })

    it('does emit an "accountsChanged" event when the account resets on later renders', async () => {
      const tab = mockActiveTab()

      const { rerender } = await renderHook<void, { account: Hex | undefined }>(
        ({ account }) => useProviderBridge({ account }),
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
    it('emits a "connect" event when the chainId is initially set', async () => {
      const tab = mockActiveTab()

      await renderHook(() => useProviderBridge({ chainId: 1 }), {
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
        ({ chainId }) => useProviderBridge({ chainId }),
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
