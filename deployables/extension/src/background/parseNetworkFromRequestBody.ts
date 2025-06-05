import { chainIdSchema } from '@zodiac/schema'
import { z } from 'zod'
import type { DetectNetworkResult } from './detectNetworkOfRpcUrl'
import { parseRequestBody } from './parseRequestBody'

const schema = z.object({ chainId: chainIdSchema, method: z.string() })

type ParseNetworkFromRequestBodyOptions = {
  url: string
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody']
}

export const parseNetworkFromRequestBody = ({
  requestBody,
  url,
}: ParseNetworkFromRequestBodyOptions): DetectNetworkResult => {
  const data = parseRequestBody(requestBody)

  if (data == null) {
    return { newEndpoint: false }
  }

  try {
    const { chainId } = schema.parse(JSON.parse(data))

    console.debug(
      `detected **new** network of JSON RPC endpoint ${url}: ${chainId}`,
    )

    return { newEndpoint: true, chainId }
  } catch {
    return { newEndpoint: false }
  }
}
