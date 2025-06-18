import { sentry } from '@/sentry'
import type { ChainId } from '@zodiac/chains'
import { probeChainId } from './probeChainId'

type DetectNetworkOfRpcOptions = {
  url: string
  tabId: number
}

type NewNetworkDetected = {
  newEndpoint: true
  chainId: ChainId
}

type ExistingNetworkDetected = {
  newEndpoint: false
}

export type DetectNetworkResult = NewNetworkDetected | ExistingNetworkDetected

const chainIdPromiseByRpcUrl = new Map<string, Promise<ChainId>>()

export const detectNetworkOfRpcUrl = async ({
  url,
  tabId,
}: DetectNetworkOfRpcOptions): Promise<DetectNetworkResult> => {
  if (!chainIdPromiseByRpcUrl.has(url)) {
    chainIdPromiseByRpcUrl.set(url, probeChainId(tabId, url))
  }

  try {
    const chainId = await chainIdPromiseByRpcUrl.get(url)

    if (chainId == null) {
      sentry.captureMessage(
        `Could not determine network for endpoint: ${url}`,
        'error',
      )

      return { newEndpoint: false }
    }

    return { newEndpoint: true, chainId }
  } catch (error) {
    sentry.captureException(error)

    chainIdPromiseByRpcUrl.delete(url)

    return { newEndpoint: false }
  }
}
