import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@/messages'
import type { JsonRpcRequest } from '@/types'
import { nanoid } from 'nanoid'
import { vi } from 'vitest'
import { callListeners, chromeMock } from '../chrome'
import { createMockTab, type MockTab } from '../creators'

type MockProviderRequestOptions = {
  request?: JsonRpcRequest
  tab?: MockTab
  callback?: () => void
}

export const mockProviderRequest = async ({
  request = { method: 'eth_accounts' },
  tab = createMockTab(),
  callback = vi.fn(),
}: MockProviderRequestOptions = {}) => {
  await callListeners(
    chromeMock.runtime.onMessage,
    {
      type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
      request,
      requestId: nanoid(),
    } satisfies InjectedProviderMessage,
    { id: chromeMock.runtime.id, tab },
    callback,
  )
}
