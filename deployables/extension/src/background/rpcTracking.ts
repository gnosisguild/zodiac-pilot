import { sentry } from '@/sentry'
import { sendMessageToTab } from '@/utils'
import { RpcMessageType } from '@zodiac/messages'
import type { ChainId } from 'ser-kit'
import { createEventListener } from './createEventListener'
import { hasJsonRpcBody } from './hasJsonRpcBody'
import { enableRpcDebugLogging } from './rpcRedirect'
import type { Event } from './types'

type TrackingState = {
  trackedTabs: Set<number>
  chainIdByRpcUrl: Map<string, number>
  chainIdPromiseByRpcUrl: Map<string, Promise<number | undefined>>

  rpcUrlsByTabId: Map<number, Set<string>>
}

type GetTrackedRpcUrlsForChainIdOptions = {
  chainId: ChainId
}

export type TrackRequestsResult = {
  getTrackedRpcUrlsForChainId: (
    options: GetTrackedRpcUrlsForChainIdOptions,
  ) => Map<string, number[]>
  trackTab: (tabId: number) => void
  untrackTab: (tabId: number) => void
  onNewRpcEndpointDetected: Event
}

export const trackRequests = (): TrackRequestsResult => {
  enableRpcDebugLogging()

  const state: TrackingState = {
    trackedTabs: new Set(),
    chainIdByRpcUrl: new Map(),
    chainIdPromiseByRpcUrl: new Map(),
    rpcUrlsByTabId: new Map(),
  }

  const onNewRpcEndpointDetected = createEventListener()

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      trackRequest(state, details)
        .then(({ newEndpoint }) => {
          if (newEndpoint) {
            onNewRpcEndpointDetected.callListeners()
          }
        })
        .catch((error) => sentry.captureException(error))
    },
    {
      urls: ['<all_urls>'],
      types: ['xmlhttprequest'],
    },
    ['requestBody'],
  )

  chrome.tabs.onRemoved.addListener((tabId) => {
    state.rpcUrlsByTabId.delete(tabId)
  })

  return {
    getTrackedRpcUrlsForChainId({ chainId }) {
      return getTabIdsByRPCUrl(state, { chainId })
    },
    trackTab(tabId) {
      state.trackedTabs.add(tabId)
    },
    untrackTab(tabId) {
      state.trackedTabs.delete(tabId)
    },
    onNewRpcEndpointDetected: onNewRpcEndpointDetected.toEvent(),
  }
}

type TrackRequestResult = {
  newEndpoint: boolean
}

const trackRequest = async (
  state: TrackingState,
  { tabId, url, method, requestBody }: chrome.webRequest.WebRequestBodyDetails,
): Promise<TrackRequestResult> => {
  const hasActiveSession = state.trackedTabs.has(tabId)

  // only handle requests in tracked tabs
  if (!hasActiveSession) {
    return { newEndpoint: false }
  }

  // only consider POST requests
  if (method !== 'POST') {
    return { newEndpoint: false }
  }

  // ignore requests to fork Rpcs
  if (url.startsWith('https://virtual.mainnet.rpc.tenderly.co/')) {
    return { newEndpoint: false }
  }

  // only consider requests with a JSON Rpc body
  if (!hasJsonRpcBody(requestBody)) {
    return { newEndpoint: false }
  }

  return detectNetworkOfRpcUrl(state, { url, tabId })
}

type GetRpcUrlsOptions = {
  chainId: ChainId
}

const getTabIdsByRPCUrl = (
  { rpcUrlsByTabId, chainIdByRpcUrl }: TrackingState,
  { chainId }: GetRpcUrlsOptions,
) => {
  const tabIdsByRpcUrl = new Map<string, number[]>()

  for (const [tabId, urls] of rpcUrlsByTabId.entries()) {
    const matchingUrls = Array.from(urls).filter(
      (url) => chainIdByRpcUrl.get(url) === chainId,
    )

    for (const url of matchingUrls) {
      const tabIds = tabIdsByRpcUrl.get(url) || []

      tabIdsByRpcUrl.set(url, [...tabIds, tabId])
    }
  }

  return tabIdsByRpcUrl
}

type DetectNetworkOfRpcOptions = {
  url: string
  tabId: number
}

const detectNetworkOfRpcUrl = async (
  state: TrackingState,
  { url, tabId }: DetectNetworkOfRpcOptions,
): Promise<TrackRequestResult> => {
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

type TrackRpcUrlOptions = {
  tabId: number
  url: string
}

const trackRpcUrl = (
  { rpcUrlsByTabId }: TrackingState,
  { tabId, url }: TrackRpcUrlOptions,
) => {
  const urls = rpcUrlsByTabId.get(tabId)

  if (urls == null) {
    rpcUrlsByTabId.set(tabId, new Set([url]))
  } else {
    urls.add(url)
  }
}

const timeout = <T>(promise: Promise<T>, errorMessage: string) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(errorMessage), 10_000),
    ),
  ])
