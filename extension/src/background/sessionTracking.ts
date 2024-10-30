import { MutableRefObject } from 'react'
import { Message, PILOT_PANEL_OPENED, PILOT_PANEL_PORT } from '../messages'
import {
  getForkedSessions,
  getOrCreatePilotSession,
  withPilotSession,
} from './activePilotSessions'
import { updateRpcRedirectRules } from './rpcRedirect'
import { startTrackingTab } from './tabsTracking'
import { updateSimulatingBadge } from './updateSimulationBadge'

export const trackSessions = () => {
  // all messages from the panel app are received here
  // (the port is opened from panel/port.ts)
  chrome.runtime.onConnect.addListener((port) => {
    const windowIdRef: MutableRefObject<number | null> = { current: null }

    if (port.name !== PILOT_PANEL_PORT) {
      return
    }

    port.onMessage.addListener((message: Message) => {
      if (message.type === PILOT_PANEL_OPENED) {
        windowIdRef.current = message.windowId
        console.log('Sidepanel opened.', message.windowId)

        startPilotSession({
          windowId: message.windowId,
          tabId: message.tabId,
        })

        if (message.tabId) {
          chrome.tabs.reload(message.tabId)
        }
      }
    })

    port.onDisconnect.addListener(async () => {
      if (windowIdRef.current == null) {
        return
      }

      console.log('Sidepanel closed.', windowIdRef.current)

      stopPilotSession(windowIdRef.current)

      chrome.tabs.query(
        { windowId: windowIdRef.current, active: true },
        (tabs) => {
          const [activeTab] = tabs

          if (activeTab == null) {
            return
          }

          if (activeTab.id != null) {
            chrome.tabs.reload(activeTab.id)
          }
        }
      )
    })
  })

  chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    withPilotSession(windowId, (session) => {
      if (session.isTracked(tabId)) {
        return
      }

      session.trackTab(tabId)

      startTrackingTab({ tabId, windowId })
    })
  })

  chrome.tabs.onRemoved.addListener((tabId, { windowId }) => {
    withPilotSession(windowId, (session) => {
      if (!session.isTracked(tabId)) {
        return
      }

      session.untrackTab(tabId)
    })
  })

  // inject the provider script into tracked tabs whenever they start loading a new page
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    withPilotSession(tab.windowId, (session) => {
      if (!session.isTracked(tabId) || info.status !== 'loading') {
        return
      }

      // The update event can be triggered multiple times for the same page load,
      // so the executed content scripts must handle the case that it has already been injected before.
      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['build/inject/contentScript.js'],
        injectImmediately: true,
      })
    })
  })
}

type StartPilotSessionOptions = {
  windowId: number
  tabId?: number
}

const startPilotSession = ({ windowId, tabId }: StartPilotSessionOptions) => {
  console.log('start pilot session', { windowId })

  const session = getOrCreatePilotSession(windowId)

  if (tabId == null) {
    return
  }

  session.trackTab(tabId)

  startTrackingTab({ tabId, windowId })
}

const stopPilotSession = (windowId: number) => {
  console.log('stop pilot session', { windowId })

  withPilotSession(windowId, (session) => session.delete())

  // make sure all rpc redirects are cleared
  updateRpcRedirectRules(getForkedSessions())
  updateSimulatingBadge(windowId)
}
