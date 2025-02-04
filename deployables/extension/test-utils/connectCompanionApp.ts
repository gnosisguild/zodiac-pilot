import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { vi } from 'vitest'
import { callListeners, chromeMock, createMockTab } from './chrome'

export const connectCompanionApp = async (
  tab: Partial<chrome.tabs.Tab> = {},
) => {
  await callListeners(
    chromeMock.runtime.onMessage,
    {
      type: CompanionAppMessageType.CONNECT,
    } satisfies CompanionAppMessage,
    { id: chrome.runtime.id, tab: createMockTab(tab) },
    vi.fn(),
  )
}
