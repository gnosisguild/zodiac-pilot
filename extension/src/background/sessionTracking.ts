import { Message, SIMULATE_START, SIMULATE_STOP } from '../messages'
import { updateRpcRedirectRules } from './rpcRedirect'
import { startTrackingTab, stopTrackingTab } from './tabsTracking'
import { PilotSession } from './types'

/** maps `windowId` to pilot session */
export const activePilotSessions = new Map<number, PilotSession>()

export const startPilotSession = (windowId: number, tabId?: number) => {
  console.log('start pilot session', windowId)
  activePilotSessions.set(windowId, {
    fork: null,
    tabs: new Set(tabId ? [tabId] : []),
  })
  if (tabId) {
    startTrackingTab(tabId, windowId)
  }
}

export const stopPilotSession = (windowId: number) => {
  console.log('stop pilot session', windowId)
  const tabs = activePilotSessions.get(windowId)?.tabs ?? []
  for (const tabId of tabs) {
    stopTrackingTab(tabId, windowId)
  }
  activePilotSessions.delete(windowId)
  // make sure all rpc redirects are cleared
  updateRpcRedirectRules(activePilotSessions)
  updateSimulatingBadge(windowId)
}

// track when a Pilot session is started for a window and when the simulation is started/stopped

chrome.runtime.onMessage.addListener((message: Message, sender) => {
  // ignore messages that don't come from the extension itself
  if (sender.id !== chrome.runtime.id) return

  if (message.type === SIMULATE_START) {
    const { networkId, rpcUrl } = message
    const session = activePilotSessions.get(message.windowId)
    if (!session) {
      throw new Error(`Pilot session not found for window #${message.windowId}`)
    }
    session.fork = { networkId, rpcUrl }
    updateRpcRedirectRules(activePilotSessions)
    console.debug(
      `start intercepting JSON RPC requests in window #${message.windowId}`,
      session.fork
    )
    updateSimulatingBadge(message.windowId)
  }

  if (message.type === SIMULATE_STOP) {
    const session = activePilotSessions.get(message.windowId)
    if (!session) {
      throw new Error(`Pilot session not found for window #${message.windowId}`)
    }
    session.fork = null
    updateRpcRedirectRules(activePilotSessions)
    console.debug(
      `stop intercepting JSON RPC requests in window #${message.windowId}`
    )
    updateSimulatingBadge(message.windowId)
  }
})

export const updateSimulatingBadge = (windowId: number) => {
  const isSimulating = !!activePilotSessions.get(windowId)?.fork
  chrome.tabs.query({ windowId }, (tabs) => {
    for (const tab of tabs) {
      // TODO use a different icon while simulating to make this more beautiful
      chrome.action.setBadgeText({
        text: isSimulating ? '🟢' : '',
        tabId: tab.id,
      })
    }
  })
}
