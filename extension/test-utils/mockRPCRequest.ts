import { ChainId } from 'ser-kit'
import { callListeners } from './callListeners'
import { chromeMock } from './chromeMock'
import { createMockWebRequest } from './createMockWebRequest'

type MockRPCRequestOptions = {
  chainId: ChainId
  tabId: number
  url: string
}

export const mockRPCRequest = async ({
  chainId,
  tabId,
  url,
}: MockRPCRequestOptions) => {
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
