import { sentry } from '@/sentry'
import { getCompanionAppUrl } from '@zodiac/env'
import type { ChainId } from 'ser-kit'
import type { Event } from '../events'
import { createEventListener } from '../events'
import { updateCSPHeaderRule } from './cspHeaderRule'
import {
  detectNetworkOfRpcUrl,
  type DetectNetworkResult,
} from './detectNetworkOfRpcUrl'
import { enableRpcDebugLogging } from './enableRpcDebugLogging'
import { hasJsonRpcBody } from './hasJsonRpcBody'
import { parseNetworkFromRequestBody } from './parseNetworkFromRequestBody'
import { createRpcTrackingState, type TrackingState } from './rpcTrackingState'
import { trackRpcUrl } from './trackRpcUrl'

type GetTrackedRpcUrlsForChainIdOptions = {
  chainId: ChainId
}

export type TrackRequestsResult = {
  getTrackedRpcUrlsForChainId: (
    options: GetTrackedRpcUrlsForChainIdOptions,
  ) => Map<string, number[]>
  trackTab: (tabId: number) => Promise<void>
  untrackTab: (tabId: number) => Promise<void>
  onNewRpcEndpointDetected: Event
}

export const trackRequests = (): TrackRequestsResult => {
  enableRpcDebugLogging()

  const state = createRpcTrackingState()

  const onNewRpcEndpointDetected = createEventListener()

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (state.chainIdByRpcUrl.has(details.url)) {
        console.debug(
          `detected already tracked network of JSON RPC endpoint ${details.url} in tab #${details.tabId}: ${state.chainIdByRpcUrl.get(details.url)}`,
        )

        return
      }

      const hasActiveSession = state.trackedTabs.has(details.tabId)

      // only handle requests in tracked tabs
      if (!hasActiveSession) {
        return
      }

      trackRequest(details)
        .then((result) => {
          if (result.newEndpoint) {
            console.debug(
              `detected **new** network of JSON RPC endpoint ${details.url} in tab #${details.tabId}: ${result.chainId}`,
            )

            state.chainIdByRpcUrl.set(details.url, result.chainId)

            trackRpcUrl(state, { tabId: details.tabId, url: details.url })

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
    async trackTab(tabId) {
      state.trackedTabs.add(tabId)

      await updateCSPHeaderRule(state.trackedTabs)
    },
    async untrackTab(tabId) {
      state.trackedTabs.delete(tabId)

      await updateCSPHeaderRule(state.trackedTabs)
    },
    onNewRpcEndpointDetected: onNewRpcEndpointDetected.toEvent(),
  }
}

const trackRequest = async ({
  tabId,
  url,
  method,
  requestBody,
}: chrome.webRequest.OnBeforeRequestDetails): Promise<DetectNetworkResult> => {
  if (method !== 'POST') {
    return { newEndpoint: false }
  }

  // ignore requests to fork Rpcs
  if (url.startsWith(`${getCompanionAppUrl()}/vnet/rpc/`)) {
    return { newEndpoint: false }
  }

  // only consider requests with a JSON Rpc body
  if (!hasJsonRpcBody(requestBody)) {
    return parseNetworkFromRequestBody({ requestBody })
  }

  return detectNetworkOfRpcUrl({ url, tabId })
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
