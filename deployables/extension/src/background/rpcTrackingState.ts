import type { ChainId } from '@zodiac/chains'

export type TrackingState = {
  trackedTabs: Set<number>
  chainIdByRpcUrl: Map<string, number>
  chainIdPromiseByRpcUrl: Map<string, Promise<ChainId | undefined>>

  rpcUrlsByTabId: Map<number, Set<string>>
}

export const createRpcTrackingState = (): TrackingState => ({
  trackedTabs: new Set(),
  chainIdByRpcUrl: new Map(),
  chainIdPromiseByRpcUrl: new Map(),
  rpcUrlsByTabId: new Map(),
})
