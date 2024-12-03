import { Message, PilotMessageType } from '@/messages'
import { isValidTab, reloadActiveTab, reloadTab } from '@/utils'
import { MutableRefObject } from 'react'
import { PILOT_PANEL_PORT } from '../const'
import {
  CallbackFn,
  createPilotSession,
  getPilotSession,
  Sessions,
  withPilotSession,
} from './activePilotSessions'
import { PilotSession } from './PilotSession'
import { TrackRequestsResult } from './rpcTracking'

export type TrackSessionsResult = {
  withPilotSession: (windowId: number, callback: CallbackFn) => Promise<void>
  getPilotSession: (windowId: number) => PilotSession
}

export const trackSessions = (
  trackRequests: TrackRequestsResult
): TrackSessionsResult => {
  /** maps `windowId` to pilot session */
  const sessions = new Map<number, PilotSession>()

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

      startPilotSession(sessions, trackRequests, {
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

      const session = sessions.get(windowIdRef.current)

      if (session) {
        console.debug('stop pilot session', { windowId: windowIdRef.current })

        session.delete()

        sessions.delete(windowIdRef.current)
      }

      reloadActiveTab()
    })
  })

  chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    withPilotSession(sessions, windowId, (session) => {
      if (session.isTracked(tabId)) {
        return
      }

      session.trackTab(tabId)
    })
  })

  chrome.tabs.onRemoved.addListener((tabId, { windowId }) => {
    withPilotSession(sessions, windowId, (session) => {
      if (!session.isTracked(tabId)) {
        return
      }

      session.untrackTab(tabId)
    })
  })

  // inject the provider script into tracked tabs whenever they start loading a new page
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    return withPilotSession(sessions, tab.windowId, (session) => {
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
          'build/injected-wallet-connect/contentScripts/enableInjectedProviderCommunication.js',
        ],
        injectImmediately: true,
      })
    })
  })

  return {
    withPilotSession: (windowId, callback) =>
      withPilotSession(sessions, windowId, callback),
    getPilotSession: (windowId) => getPilotSession(sessions, windowId),
  }
}

type StartPilotSessionOptions = {
  windowId: number
  tabId?: number
}

const startPilotSession = (
  sessions: Sessions,
  trackRequests: TrackRequestsResult,
  { windowId, tabId }: StartPilotSessionOptions
) => {
  console.debug('start pilot session', { windowId })

  let session = sessions.get(windowId)

  if (session == null) {
    session = createPilotSession(trackRequests, windowId)

    sessions.set(windowId, session)
  }

  if (tabId == null) {
    return session
  }

  session.trackTab(tabId)

  return session
}
