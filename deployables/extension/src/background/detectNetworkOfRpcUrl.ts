import { sentry } from '@/sentry'
import { sendMessageToTab } from '@/utils'
import { RpcMessageType } from '@zodiac/messages'
import type { TrackingState } from './rpcTrackingState'
import { trackRpcUrl } from './trackRpcUrl'

type DetectNetworkOfRpcOptions = {
  url: string
  tabId: number
}

export type DetectNetworkResult = {
  newEndpoint: boolean
}

export const detectNetworkOfRpcUrl = async (
  state: TrackingState,
  { url, tabId }: DetectNetworkOfRpcOptions,
): Promise<DetectNetworkResult> => {
  const { chainIdPromiseByRpcUrl, chainIdByRpcUrl } = state

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
    const result = await chainIdPromiseByRpcUrl.get(url)

    if (result == null || chainIdByRpcUrl.has(url)) {
      if (result == null) {
        sentry.captureMessage(
          `Could not determine network for endpoint: ${url}`,
          'error',
        )
      }

      console.debug(
        `detected already tracked network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`,
      )

      return { newEndpoint: false }
    }

    trackRpcUrl(state, { tabId, url })

    chainIdByRpcUrl.set(url, result)

    console.debug(
      `detected **new** network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`,
    )

    return { newEndpoint: true }
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
