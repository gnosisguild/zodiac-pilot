import { Message, SIMULATE_START, SIMULATE_STOP } from '../messages'
import {
  createPilotSession,
  getForkedSessions,
  getPilotSession,
  withPilotSession,
} from './activePilotSessions'
import { updateRpcRedirectRules } from './rpcRedirect'
import { rpcUrlsPerTab } from './rpcTracking'
import { startTrackingTab, stopTrackingTab } from './tabsTracking'
import { updateSimulatingBadge } from './updateSimulationBadge'

type StartPilotSessionOptions = {
  windowId: number
  tabId?: number
}

export const startPilotSession = ({
  windowId,
  tabId,
}: StartPilotSessionOptions) => {
  console.log('start pilot session', { windowId })

  const session = createPilotSession(windowId)

  if (tabId == null) {
    return
  }

  session.trackTab(tabId)

  startTrackingTab(tabId, windowId)
}

export const stopPilotSession = (windowId: number) => {
  console.log('stop pilot session', { windowId })

  withPilotSession(windowId, (session) => {
    for (const tabId of session.tabs) {
      stopTrackingTab(tabId, windowId)
    }

    session.delete()
  })

  // make sure all rpc redirects are cleared
  updateRpcRedirectRules(getForkedSessions())
  updateSimulatingBadge(windowId)
}

// track when a Pilot session is started for a window and when the simulation is started/stopped

chrome.runtime.onMessage.addListener((message: Message, sender) => {
  // ignore messages that don't come from the extension itself
  if (sender.id !== chrome.runtime.id) {
    return
  }

  if (message.type === SIMULATE_START) {
    const { networkId, rpcUrl } = message
    const session = getPilotSession(message.windowId)
    const fork = session.createFork({ networkId, rpcUrl })

    updateRpcRedirectRules(getForkedSessions())
    console.debug(
      `start intercepting JSON RPC requests in window #${message.windowId}`,
      fork
    )
    updateSimulatingBadge(message.windowId)
  }

  if (message.type === SIMULATE_STOP) {
    const session = getPilotSession(message.windowId)

    session.clearFork()

    updateRpcRedirectRules(getForkedSessions())
    console.debug(
      `stop intercepting JSON RPC requests in window #${message.windowId}`
    )
    updateSimulatingBadge(message.windowId)
  }
})

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  withPilotSession(windowId, ({ isTracked, trackTab }) => {
    if (isTracked(tabId)) {
      return
    }

    trackTab(tabId)

    startTrackingTab(tabId, windowId)
  })
})

chrome.tabs.onRemoved.addListener((tabId, { windowId }) => {
  withPilotSession(windowId, ({ isTracked, untrackTab }) => {
    if (!isTracked(tabId)) {
      return
    }

    untrackTab(tabId)

    stopTrackingTab(tabId, windowId, true)

    rpcUrlsPerTab.delete(tabId)
  })
})
