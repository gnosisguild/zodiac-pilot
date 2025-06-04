import { chainIdSchema } from '@zodiac/schema'
import { z } from 'zod'
import type { DetectNetworkResult } from './detectNetworkOfRpcUrl'
import { parseRequestBody } from './parseRequestBody'
import type { TrackingState } from './rpcTrackingState'
import { trackRpcUrl } from './trackRpcUrl'

const schema = z.object({ chainId: chainIdSchema, method: z.string() })

type ParseNetworkFromRequestBodyOptions = {
  url: string
  tabId: number
  requestBody: chrome.webRequest.OnBeforeRequestDetails['requestBody']
}

export const parseNetworkFromRequestBody = (
  state: TrackingState,
  { requestBody, url, tabId }: ParseNetworkFromRequestBodyOptions,
): DetectNetworkResult => {
  const { chainIdByRpcUrl } = state

  if (chainIdByRpcUrl.has(url)) {
    console.debug(
      `detected already tracked network of JSON RPC endpoint ${url} : ${chainIdByRpcUrl.get(url)}`,
    )

    return { newEndpoint: false }
  }

  const data = parseRequestBody(requestBody)

  if (data == null) {
    return { newEndpoint: false }
  }

  try {
    const { chainId } = schema.parse(JSON.parse(data))

    chainIdByRpcUrl.set(url, chainId)

    trackRpcUrl(state, { url, tabId })

    console.debug(
      `detected **new** network of JSON RPC endpoint ${url}: ${chainId}`,
    )

    return { newEndpoint: true }
  } catch {
    return { newEndpoint: false }
  }
}
