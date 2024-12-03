import { RpcMessageType } from '@/messages'
import { sendMessageToTab } from '@/utils'
import { ChainId } from 'ser-kit'
import { hasJsonRpcBody } from './hasJsonRpcBody'
import { enableRpcDebugLogging } from './rpcRedirect'

type TrackingState = {
  trackedTabs: Set<number>
  chainIdByRpcUrl: Map<string, number>
  chainIdPromiseByRpcUrl: Map<string, Promise<number | undefined>>

  rpcUrlsByTabId: Map<number, Set<string>>
}

type GetTrackedRpcUrlsForChainIdOptions = {
  chainId: ChainId
}

type Event<T> = {
  addListener: (listener: T) => void
  removeListener: (listener: T) => void
  removeAllListeners: () => void
}

type NewRpcEndpointDetectedEventListener = () => void

export type TrackRequestsResult = {
  getTrackedRpcUrlsForChainId: (
    options: GetTrackedRpcUrlsForChainIdOptions
  ) => Map<number, string[]>
  trackTab: (tabId: number) => void
  untrackTab: (tabId: number) => void
  onNewRpcEndpointDetected: Event<NewRpcEndpointDetectedEventListener>
}

export const trackRequests = (): TrackRequestsResult => {
  enableRpcDebugLogging()

  const state: TrackingState = {
    trackedTabs: new Set(),
    chainIdByRpcUrl: new Map(),
    chainIdPromiseByRpcUrl: new Map(),
    rpcUrlsByTabId: new Map(),
  }

  const listeners = new Set<NewRpcEndpointDetectedEventListener>()

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      trackRequest(state, details).then(({ newEndpoint }) => {
        if (newEndpoint) {
          listeners.forEach((listener) => listener())
        }
      })
    },
    {
      urls: ['<all_urls>'],
      types: ['xmlhttprequest'],
    },
    ['requestBody']
  )

  chrome.tabs.onRemoved.addListener((tabId) => {
    state.rpcUrlsByTabId.delete(tabId)
  })

  return {
    getTrackedRpcUrlsForChainId: ({ chainId }) =>
      getRpcUrlsByTabId(state, { chainId }),
    onNewRpcEndpointDetected: {
      addListener: (listener) => {
        listeners.add(listener)
      },
      removeListener: (listener) => {
        listeners.delete(listener)
      },
      removeAllListeners: () => {
        listeners.clear()
      },
    },
    trackTab(tabId) {
      state.trackedTabs.add(tabId)
    },
    untrackTab(tabId) {
      state.trackedTabs.delete(tabId)
    },
  }
}

type TrackRequestResult = {
  newEndpoint: boolean
}

const trackRequest = async (
  state: TrackingState,
  { tabId, url, method, requestBody }: chrome.webRequest.WebRequestBodyDetails
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

const getRpcUrlsByTabId = (
  { rpcUrlsByTabId, chainIdByRpcUrl }: TrackingState,
  { chainId }: GetRpcUrlsOptions
) => {
  return rpcUrlsByTabId.entries().reduce((result, [tabId, urls]) => {
    result.set(
      tabId,
      Array.from(urls).filter((url) => chainIdByRpcUrl.get(url) === chainId)
    )

    return result
  }, new Map<number, string[]>())
}

type DetectNetworkOfRpcOptions = {
  url: string
  tabId: number
}

const detectNetworkOfRpcUrl = async (
  state: TrackingState,
  { url, tabId }: DetectNetworkOfRpcOptions
): Promise<TrackRequestResult> => {
  const { chainIdPromiseByRpcUrl, chainIdByRpcUrl } = state

  if (!chainIdPromiseByRpcUrl.has(url)) {
    chainIdPromiseByRpcUrl.set(
      url,
      sendMessageToTab(tabId, { type: RpcMessageType.PROBE_CHAIN_ID, url })
    )
  }

  const result = await chainIdPromiseByRpcUrl.get(url)

  if (result == null || chainIdByRpcUrl.has(url)) {
    console.debug(
      `detected already tracked network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
    )

    return { newEndpoint: false }
  }

  trackRpcUrl(state, { tabId, url })

  chainIdByRpcUrl.set(url, result)

  console.debug(
    `detected **new** network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
  )

  return { newEndpoint: true }
}

type TrackRpcUrlOptions = {
  tabId: number
  url: string
}

const trackRpcUrl = (
  { rpcUrlsByTabId }: TrackingState,
  { tabId, url }: TrackRpcUrlOptions
) => {
  const urls = rpcUrlsByTabId.get(tabId)

  if (urls == null) {
    rpcUrlsByTabId.set(tabId, new Set([url]))
  } else {
    urls.add(url)
  }
}
