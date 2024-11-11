import { RPCMessageType } from '@/messages'
import { sendMessageToTab } from '@/utils'
import { ChainId } from 'ser-kit'
import { isTrackedTab } from './activePilotSessions'
import { hasJsonRpcBody } from './hasJsonRpcBody'

type TrackingState = {
  chainIdByRpcUrl: Map<string, number>
  chainIdPromiseByRpcUrl: Map<string, Promise<number | undefined>>

  rpcUrlsByTabId: Map<number, Set<string>>
}

const trackRequest =
  (state: TrackingState) =>
  ({
    tabId,
    url,
    method,
    requestBody,
  }: chrome.webRequest.WebRequestBodyDetails) => {
    const hasActiveSession = isTrackedTab({ tabId })

    // only handle requests in tracked tabs
    if (!hasActiveSession) {
      return
    }

    // only consider POST requests
    if (method !== 'POST') {
      return
    }

    // ignore requests to fork RPCs
    if (url.startsWith('https://virtual.mainnet.rpc.tenderly.co/')) {
      return
    }

    // only consider requests with a JSON RPC body
    if (!hasJsonRpcBody(requestBody)) {
      return
    }

    detectNetworkOfRpcUrl(state, { url, tabId })
  }

type GetTrackedRPCUrlsForChainIdOptions = {
  chainId: ChainId
}

export type TrackRequestsResult = {
  getTrackedRPCUrlsForChainId: (
    options: GetTrackedRPCUrlsForChainIdOptions
  ) => Map<number, string[]>
}

export const trackRequests = (): TrackRequestsResult => {
  const state: TrackingState = {
    chainIdByRpcUrl: new Map(),
    chainIdPromiseByRpcUrl: new Map(),
    rpcUrlsByTabId: new Map(),
  }

  chrome.webRequest.onBeforeRequest.addListener(
    trackRequest(state),
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
    getTrackedRPCUrlsForChainId: ({ chainId }) =>
      getRPCUrlsByTabId(state, { chainId }),
  }
}

type GetRPCUrlsOptions = {
  chainId: ChainId
}

const getRPCUrlsByTabId = (
  { rpcUrlsByTabId, chainIdByRpcUrl }: TrackingState,
  { chainId }: GetRPCUrlsOptions
) => {
  return rpcUrlsByTabId.entries().reduce((result, [tabId, urls]) => {
    result.set(
      tabId,
      Array.from(urls).filter((url) => chainIdByRpcUrl.get(url) === chainId)
    )

    return result
  }, new Map<number, string[]>())
}

type DetectNetworkOfRPCOptions = {
  url: string
  tabId: number
}

const detectNetworkOfRpcUrl = async (
  state: TrackingState,
  { url, tabId }: DetectNetworkOfRPCOptions
) => {
  const { chainIdPromiseByRpcUrl, chainIdByRpcUrl } = state

  if (!chainIdPromiseByRpcUrl.has(url)) {
    chainIdPromiseByRpcUrl.set(
      url,
      sendMessageToTab(tabId, { type: RPCMessageType.PROBE_CHAIN_ID, url })
    )
  }

  const result = await chainIdPromiseByRpcUrl.get(url)

  if (result == null || chainIdByRpcUrl.has(url)) {
    console.debug(
      `detected already tracked network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
    )

    return
  }

  trackRPCUrl(state, { tabId, url })

  chainIdByRpcUrl.set(url, result)

  console.debug(
    `detected **new** network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
  )
}

type TrackRPCUrlOptions = {
  tabId: number
  url: string
}

const trackRPCUrl = (
  { rpcUrlsByTabId }: TrackingState,
  { tabId, url }: TrackRPCUrlOptions
) => {
  const urls = rpcUrlsByTabId.get(tabId)

  if (urls == null) {
    rpcUrlsByTabId.set(tabId, new Set([url]))
  } else {
    urls.add(url)
  }
}
