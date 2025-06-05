import { chainIdSchema } from '@zodiac/schema'
import { z } from 'zod'
import type { DetectNetworkResult } from './detectNetworkOfRpcUrl'
import { parseRequestBody } from './parseRequestBody'

const schema = z.object({ chainId: chainIdSchema, method: z.string() })

type ParseNetworkFromRequestBodyOptions = {
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody']
}

export const parseNetworkFromRequestBody = ({
  requestBody,
}: ParseNetworkFromRequestBodyOptions): DetectNetworkResult => {
  const data = parseRequestBody(requestBody)

  if (data == null) {
    return { newEndpoint: false }
  }

  try {
    const { chainId } = schema.parse(JSON.parse(data))

    return { newEndpoint: true, chainId }
  } catch {
    return { newEndpoint: false }
  }
}
