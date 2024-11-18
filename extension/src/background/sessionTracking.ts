import { Message, PilotMessageType } from '@/messages'
import { isValidTab, reloadActiveTab, reloadTab } from '@/utils'
import { MutableRefObject } from 'react'
import { PILOT_PANEL_PORT } from '../const'
import {
  getOrCreatePilotSession,
  withPilotSession,
} from './activePilotSessions'

export const trackSessions = () => {
  // all messages from the panel app are received here
  // (the port is opened from panel/port.ts)
  chrome.runtime.onConnect.addListener((port) => {
    const windowIdRef: MutableRefObject<number | null> = { current: null }

    if (port.name !== PILOT_PANEL_PORT) {
      return
    }

    port.onMessage.addListener((message: Message) => {
      if (message.type !== PilotMessageType.PILOT_PANEL_OPENED) {
        return
      }

      windowIdRef.current = message.windowId
      console.debug('Sidepanel opened.', message.windowId)

      startPilotSession({
        windowId: message.windowId,
        tabId: message.tabId,
      })

      if (message.tabId) {
        reloadTab(message.tabId)
      }
    })

    port.onDisconnect.addListener(() => {
      if (windowIdRef.current == null) {
        return
      }

      console.debug('Sidepanel closed.', windowIdRef.current)

      stopPilotSession(windowIdRef.current)

      reloadActiveTab()
    })
  })

  chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    withPilotSession(windowId, (session) => {
      if (session.isTracked(tabId)) {
        return
      }

      session.trackTab(tabId)
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

      if (!isValidTab(tab.url)) {
        return
      }

      // The update event can be triggered multiple times for the same page load,
      // so the executed content scripts must handle the case that it has already been injected before.
      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: [
          'build/injected-wallet-connect/enableInjectedProviderCommunication.js',
        ],
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
  console.debug('start pilot session', { windowId })

  const session = getOrCreatePilotSession(windowId)

  if (tabId == null) {
    return
  }

  session.trackTab(tabId)
}

const stopPilotSession = (windowId: number) => {
  console.debug('stop pilot session', { windowId })

  withPilotSession(windowId, (session) => session.delete())
}
