import { CompanionAppMessageType } from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import {
  callListeners,
  chromeMock,
  createMockTab,
  type MockTab,
} from '@zodiac/test-utils/chrome'
import { vi } from 'vitest'

export const mockIncomingRouteUpdate = async (
  route: ExecutionRoute,
  tab: MockTab = createMockTab(),
) => {
  await callListeners(
    chromeMock.runtime.onMessage,
    {
      type: CompanionAppMessageType.SAVE_ROUTE,
      data: route,
    },
    { id: chromeMock.runtime.id, tab },
    vi.fn(),
  )
}
