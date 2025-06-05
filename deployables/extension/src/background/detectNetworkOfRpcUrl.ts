import { sentry } from '@/sentry'
import { sendMessageToTab } from '@/utils'
import type { ChainId } from '@zodiac/chains'
import { RpcMessageType } from '@zodiac/messages'

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
    chainIdPromiseByRpcUrl.set(
      url,
      timeout(
        sendMessageToTab(tabId, { type: RpcMessageType.PROBE_CHAIN_ID, url }),
        `Could not probe chain ID for url "${url}".`,
      ),
    )
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

const CHAIN_ID_PROBING_TIMEOUT = 10_000

const timeout = <T>(promise: Promise<T>, errorMessage: string) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(errorMessage), CHAIN_ID_PROBING_TIMEOUT),
    ),
  ])
