import { sentry } from '@/sentry'
import type { ChainId } from 'ser-kit'
import { createEventListener } from './createEventListener'
import {
  detectNetworkOfRpcUrl,
  type DetectNetworkResult,
} from './detectNetworkOfRpcUrl'
import { hasJsonRpcBody } from './hasJsonRpcBody'
import { enableRpcDebugLogging } from './rpcRedirect'
import { createRpcTrackingState, type TrackingState } from './rpcTrackingState'
import type { Event } from './types'

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

  const state = createRpcTrackingState()

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

      return undefined
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
      return getTabIdsByRpcUrl(state, { chainId })
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

const trackRequest = async (
  state: TrackingState,
  { tabId, url, method, requestBody }: chrome.webRequest.OnBeforeRequestDetails,
): Promise<DetectNetworkResult> => {
  const hasActiveSession = state.trackedTabs.has(tabId)

  // only handle requests in tracked tabs
  if (!hasActiveSession) {
    return { newEndpoint: false }
  }

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

const getTabIdsByRpcUrl = (
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
