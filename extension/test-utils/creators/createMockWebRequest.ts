import { randomUUID } from 'crypto'
import type { WebRequest } from 'vitest-chrome/types/vitest-chrome'

const encoder = new TextEncoder()

export const createMockWebRequest = ({
  requestBody,
  ...request
}: Partial<Omit<WebRequest.WebRequestBodyDetails, 'requestBody'>> & {
  requestBody?: unknown
} = {}): WebRequest.WebRequestBodyDetails => ({
  frameId: -1,
  method: 'GET',
  parentFrameId: -1,
  requestId: randomUUID(),
  tabId: -1,
  timeStamp: new Date().getTime(),
  type: chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
  url: 'https://any-other-url.com',

  requestBody: {
    raw: [{ bytes: encoder.encode(JSON.stringify(requestBody)) }],
  },

  ...request,
})
