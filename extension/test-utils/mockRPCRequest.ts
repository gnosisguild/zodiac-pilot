import { ChainId } from 'ser-kit'
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
}: MockRPCRequestOptions) =>
  new Promise<void>((resolve) => {
    // @ts-expect-error I don't give a crap in a test helper
    chromeMock.tabs.sendMessage.mockImplementation((_, __, respond) => {
      if (typeof respond === 'function') {
        // @ts-expect-error see above
        respond(chainId)
      }
    })

    chromeMock.webRequest.onBeforeRequest.callListeners(
      createMockWebRequest({
        tabId,
        method: 'POST',
        url,
        requestBody: { jsonrpc: '2.0' },
      })
    )

    resolve()
  })
