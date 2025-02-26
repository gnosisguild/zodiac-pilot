import type { ChainId } from 'ser-kit'
import {
  callListeners,
  chromeMock,
  createMockTab,
  createMockWebRequest,
} from '../chrome'

type MockRpcRequestOptions = {
  chainId: ChainId
  url: string
}

export const mockRpcRequest = async (
  tab: Partial<chrome.tabs.Tab>,
  { chainId, url }: MockRpcRequestOptions,
) => {
  const currentTab = createMockTab(tab)

  chromeMock.tabs.get.mockResolvedValue(currentTab)

  // @ts-expect-error I don't give a crap in a test helper
  chromeMock.tabs.sendMessage.mockImplementation((_, __, respond) => {
    if (typeof respond === 'function') {
      // @ts-expect-error see above
      respond(chainId)
    }

    return chainId
  })

  return callListeners(
    chromeMock.webRequest.onBeforeRequest,
    createMockWebRequest({
      tabId: currentTab.id,
      method: 'POST',
      url,
      requestBody: { jsonrpc: '2.0' },
    }),
  )
}
