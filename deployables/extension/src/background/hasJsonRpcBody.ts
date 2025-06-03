import { z } from 'zod'

const decoder = new TextDecoder('utf-8')

const rpcSchema = z.object({ jsonrpc: z.literal('2.0') })
const schema = z.union([rpcSchema.array(), rpcSchema])

export const hasJsonRpcBody = (
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody'],
) => {
  if (requestBody == null) {
    return false
  }

  if (requestBody.raw == null) {
    return false
  }

  const [data] = requestBody.raw

  if (data == null) {
    return false
  }

  if (data.bytes == null) {
    return false
  }

  try {
    const json = JSON.parse(decodeURIComponent(decoder.decode(data.bytes)))

    schema.parse(json)

    return true
  } catch {
    return false
  }
}
