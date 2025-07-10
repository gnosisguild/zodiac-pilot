import type { ChainId } from 'ser-kit'
import { chromeMock, createMockTab } from '../chrome'
import { mockWebRequest } from './mockWebRequest'

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

  chromeMock.tabs.sendMessage.mockImplementation((_, __, respond) => {
    if (typeof respond === 'function') {
      // @ts-expect-error see above
      respond(chainId)
    }

    return chainId
  })

  return mockWebRequest(currentTab, {
    method: 'POST',
    url,
    requestBody: { jsonrpc: '2.0' },
  })
}
