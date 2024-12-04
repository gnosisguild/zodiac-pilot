import { Message, PilotMessageType } from '@/messages'
import { sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { removeCSPHeaderRule, updateCSPHeaderRule } from './cspHeaderRule'
import { addRpcRedirectRules, removeAllRpcRedirectRules } from './rpcRedirect'
import { TrackRequestsResult } from './rpcTracking'
import { Fork } from './types'

export class PilotSession {
  private id: number

  public readonly tabs: Set<number>
  private fork: Fork | null
  private rpcTracking: TrackRequestsResult
  private handleNewRpcEndpoint: () => void

  constructor(windowId: number, trackRequests: TrackRequestsResult) {
    this.id = windowId
    this.tabs = new Set()
    this.fork = null
    this.rpcTracking = trackRequests

    this.handleNewRpcEndpoint = () => this._handleNewRpcEndpoint()
  }

  isTracked(tabId: number) {
    return this.tabs.has(tabId)
  }

  trackTab(tabId: number) {
    this.tabs.add(tabId)

    this.rpcTracking.trackTab(tabId)

    updateCSPHeaderRule(this.tabs)

    sendMessageToTab(tabId, {
      type: PilotMessageType.PILOT_CONNECT,
    } satisfies Message)
  }

  untrackTab(tabId: number) {
    this.tabs.delete(tabId)

    this.rpcTracking.untrackTab(tabId)

    updateCSPHeaderRule(this.tabs)
  }

  async delete() {
    for (const tabId of this.tabs) {
      sendMessageToTab(tabId, {
        type: PilotMessageType.PILOT_DISCONNECT,
      })
    }

    this.rpcTracking.onNewRpcEndpointDetected.removeAllListeners()

    removeCSPHeaderRule()
    await removeAllRpcRedirectRules(this)
  }

  getTabs() {
    return Array.from(this.tabs)
  }

  getFork() {
    invariant(this.fork != null, 'Session is not forked')

    return Object.freeze(this.fork)
  }

  isForked() {
    return this.fork != null
  }

  _handleNewRpcEndpoint() {
    if (this.fork == null) {
      return
    }

    return addRpcRedirectRules(
      this,
      this.rpcTracking.getTrackedRpcUrlsForChainId({
        chainId: this.fork.chainId,
      })
    )
  }

  async createFork(fork: Fork) {
    invariant(!this.isForked(), 'Session has already been forked!')

    this.fork = fork

    await addRpcRedirectRules(
      this,
      this.rpcTracking.getTrackedRpcUrlsForChainId({ chainId: fork.chainId })
    )

    this.rpcTracking.onNewRpcEndpointDetected.addListener(
      this.handleNewRpcEndpoint
    )
  }

  async updateFork(rpcUrl: string) {
    invariant(this.fork != null, 'Session is not forked')

    this.fork = { ...this.fork, rpcUrl }

    await removeAllRpcRedirectRules(this)
    await addRpcRedirectRules(
      this,
      this.rpcTracking.getTrackedRpcUrlsForChainId({
        chainId: this.fork.chainId,
      })
    )
  }

  async clearFork() {
    if (this.fork == null) {
      return
    }

    this.fork = null

    await removeAllRpcRedirectRules(this)

    this.rpcTracking.onNewRpcEndpointDetected.removeListener(
      this.handleNewRpcEndpoint
    )
  }
}
