export type TrackingState = {
  trackedTabs: Set<number>
  chainIdByRpcUrl: Map<string, number>

  rpcUrlsByTabId: Map<number, Set<string>>
}

export const createRpcTrackingState = (): TrackingState => ({
  trackedTabs: new Set(),
  chainIdByRpcUrl: new Map(),
  rpcUrlsByTabId: new Map(),
})
