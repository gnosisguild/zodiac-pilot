import type { ChainId } from 'ser-kit'
import { callListeners, chromeMock } from '../chrome'
import { createMockTab, createMockWebRequest } from '../creators'

type MockRpcRequestOptions = {
  chainId: ChainId
  tabId: number
  url: string
}

export const mockRpcRequest = async ({
  chainId,
  tabId,
  url,
}: MockRpcRequestOptions) => {
  const tab = createMockTab({ id: tabId })

  chromeMock.tabs.get.mockResolvedValue(tab)

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
      tabId,
      method: 'POST',
      url,
      requestBody: { jsonrpc: '2.0' },
    })
  )
}
