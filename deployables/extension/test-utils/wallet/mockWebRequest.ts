import type { MockTab, MockWebRequest } from '@zodiac/test-utils/chrome'
import { callListeners, chromeMock, createMockWebRequest } from '../chrome'

export const mockWebRequest = (
  tab: MockTab,
  details: Partial<MockWebRequest> = {},
) => {
  return callListeners(
    chromeMock.webRequest.onBeforeRequest,
    createMockWebRequest({ ...details, tabId: tab.id }),
  )
}
