import { randomUUID } from 'crypto'
import type { WebRequest } from 'vitest-chrome/types'

const encoder = new TextEncoder()

export type MockWebRequest = Omit<
  WebRequest.WebRequestBodyDetails,
  'requestBody'
> & {
  requestBody: unknown
}

export const createMockWebRequest = ({
  requestBody,
  ...request
}: Partial<MockWebRequest> = {}): WebRequest.WebRequestBodyDetails => ({
  frameId: -1,
  method: 'GET',
  parentFrameId: -1,
  requestId: randomUUID(),
  tabId: -1,
  timeStamp: new Date().getTime(),
  type: chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
  url: 'https://any-other-url.com',

  requestBody: {
    raw: [
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore The type is not 100% matching but should be fine
        // for a test utility
        bytes: encoder.encode(JSON.stringify(requestBody)),
      },
    ],
  },

  ...request,
})
