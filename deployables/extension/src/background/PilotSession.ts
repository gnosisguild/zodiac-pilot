import { sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type Message,
} from '@zodiac/messages'
import { removeCSPHeaderRule, updateCSPHeaderRule } from './cspHeaderRule'
import { addRpcRedirectRules, removeAllRpcRedirectRules } from './rpcRedirect'
import type { TrackRequestsResult } from './rpcTracking'
import type { Fork } from './types'

export type Sessions = Map<number, PilotSession>

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
    await removeAllRpcRedirectRules(this.getTabs())
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
      this.getTabs(),
      this.getFork(),
      this.rpcTracking.getTrackedRpcUrlsForChainId({
        chainId: this.fork.chainId,
      }),
    )
  }

  async createFork(fork: Fork) {
    invariant(!this.isForked(), 'Session has already been forked!')

    this.fork = fork

    await addRpcRedirectRules(
      this.getTabs(),
      this.getFork(),
      this.rpcTracking.getTrackedRpcUrlsForChainId({ chainId: fork.chainId }),
    )

    await this.updateForkInTabs()

    this.rpcTracking.onNewRpcEndpointDetected.addListener(
      this.handleNewRpcEndpoint,
    )
  }

  async updateFork(rpcUrl: string) {
    invariant(this.fork != null, 'Session is not forked')

    this.fork = { ...this.fork, rpcUrl }

    await removeAllRpcRedirectRules(this.getTabs())
    await addRpcRedirectRules(
      this.getTabs(),
      this.getFork(),
      this.rpcTracking.getTrackedRpcUrlsForChainId({
        chainId: this.fork.chainId,
      }),
    )

    await this.updateForkInTabs()
  }

  updateForkInTabs() {
    return Promise.all(
      this.getTabs().map((tabId) =>
        chrome.tabs.sendMessage(tabId, {
          type: CompanionAppMessageType.FORK_UPDATED,
          forkUrl: this.getFork().rpcUrl ?? null,
        } satisfies CompanionAppMessage),
      ),
    )
  }

  async clearFork() {
    if (this.fork == null) {
      return
    }

    this.fork = null

    await removeAllRpcRedirectRules(this.getTabs())

    this.rpcTracking.onNewRpcEndpointDetected.removeListener(
      this.handleNewRpcEndpoint,
    )

    await this.updateForkInTabs()
  }
}
