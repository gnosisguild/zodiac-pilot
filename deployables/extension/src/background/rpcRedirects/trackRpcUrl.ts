import type { TrackingState } from './rpcTrackingState'

type TrackRpcUrlOptions = {
  tabId: number
  url: string
}

export const trackRpcUrl = (
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
