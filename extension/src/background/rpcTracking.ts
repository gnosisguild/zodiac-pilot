import { PROBE_CHAIN_ID } from '../messages'
import { isTrackedTab } from './activePilotSessions'
import { hasJsonRpcBody } from './hasJsonRpcBody'

// Keep track of the network IDs for all JSON RPC endpoints used from apps
const networkIdOfRpcUrl = new Map<string, number | undefined>()
const networkIdOfRpcUrlPromise = new Map<string, Promise<number | undefined>>()

const rpcUrlsPerTab = new Map<number, Set<string>>()

const trackRequest = ({
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
  // skip urls we already know
  if (networkIdOfRpcUrlPromise.has(url)) {
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

  detectNetworkOfRpcUrl(url, tabId)
}

export const trackRequests = () => {
  chrome.webRequest.onBeforeRequest.addListener(
    trackRequest,
    {
      urls: ['<all_urls>'],
      types: ['xmlhttprequest'],
    },
    ['requestBody']
  )
}

type GetRPCUrlsOptions = {
  tabId: number
  networkId: number
}

export const getRPCUrls = ({ tabId, networkId }: GetRPCUrlsOptions) => {
  const urls = rpcUrlsPerTab.get(tabId)

  if (urls == null) {
    return []
  }

  return Array.from(urls).filter(
    (url) => networkIdOfRpcUrl.get(url) === networkId
  )
}

type TrackRPCUrlOptions = {
  tabId: number
  url: string
}

const trackRPCUrl = ({ tabId, url }: TrackRPCUrlOptions) => {
  const urls = rpcUrlsPerTab.get(tabId)

  if (urls == null) {
    rpcUrlsPerTab.set(tabId, new Set([url]))
  } else {
    urls.add(url)
  }
}

const detectNetworkOfRpcUrl = async (url: string, tabId: number) => {
  if (!networkIdOfRpcUrlPromise.has(url)) {
    const promise = new Promise<number | undefined>((resolve) => {
      // fetch from the injected script, so the request has the apps origin (otherwise the request may be blocked by the RPC provider)
      chrome.tabs.sendMessage(tabId, { type: PROBE_CHAIN_ID, url }, resolve)
    })

    networkIdOfRpcUrlPromise.set(url, promise)
  }

  const result = await networkIdOfRpcUrlPromise.get(url)

  if (result == null || networkIdOfRpcUrl.has(url)) {
    return
  }

  trackRPCUrl({ tabId, url })

  networkIdOfRpcUrl.set(url, result)

  console.debug(
    `detected network of JSON RPC endpoint ${url} in tab #${tabId}: ${result}`
  )
}

chrome.tabs.onRemoved.addListener((tabId) => {
  rpcUrlsPerTab.delete(tabId)
})
