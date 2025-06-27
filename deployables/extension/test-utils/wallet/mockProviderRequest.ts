import type { JsonRpcRequest } from '@/types'
import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@zodiac/messages'
import type { MockTab } from '@zodiac/test-utils/chrome'
import { nanoid } from 'nanoid'
import { vi } from 'vitest'
import { callListeners, chromeMock, createMockTab } from '../chrome'

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
      injectionId: nanoid(),
    } satisfies InjectedProviderMessage,
    { id: chromeMock.runtime.id, tab },
    callback,
  )
}
