import { z } from 'zod'
import { parseRequestBody } from './parseRequestBody'

const rpcSchema = z.object({ jsonrpc: z.literal('2.0') })
const schema = z.union([rpcSchema.array(), rpcSchema])

export const hasJsonRpcBody = (
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody'],
) => {
  const data = parseRequestBody(requestBody)

  if (data == null) {
    return false
  }

  try {
    const json = JSON.parse(data)

    schema.parse(json)

    return true
  } catch {
    return false
  }
}
