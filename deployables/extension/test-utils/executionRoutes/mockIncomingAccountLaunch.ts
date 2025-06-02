import type { Account } from '@/companion'
import { CompanionAppMessageType } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  callListeners,
  chromeMock,
  createMockTab,
  type MockTab,
} from '@zodiac/test-utils/chrome'
import { vi } from 'vitest'

export const mockIncomingAccountLaunch = async (
  { route, account }: { route: ExecutionRoute; account?: Account },
  tab: MockTab = createMockTab(),
) => {
  await callListeners(
    chromeMock.runtime.onMessage,
    {
      type: CompanionAppMessageType.SAVE_AND_LAUNCH,
      data: route,
      account,
    },
    { id: chromeMock.runtime.id, tab },
    vi.fn(),
  )
}
