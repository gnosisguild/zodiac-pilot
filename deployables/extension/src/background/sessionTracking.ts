import { PILOT_PANEL_PORT } from '@/port-handling'
import { isCompanionApp, isValidTab, reloadActiveTab, reloadTab } from '@/utils'
import { PilotMessageType, type Message } from '@zodiac/messages'
import { format } from 'date-fns'
import type { RefObject } from 'react'
import type { Event } from './events'
import { createEventListener } from './events'
import { getPilotSession } from './getPilotSession'
import { PilotSession, type Sessions } from './PilotSession'
import type { TrackRequestsResult } from './rpcRedirects'
import { withPilotSession, type CallbackFn } from './withPilotSession'

type SessionDeletedEventListener = (windowId: number) => void

export type TrackSessionsResult = {
  withPilotSession: (windowId: number, callback: CallbackFn) => Promise<void>
  getPilotSession: (windowId: number) => PilotSession
  onDeleted: Event<SessionDeletedEventListener>
}

export const trackSessions = (
  trackRequests: TrackRequestsResult,
): TrackSessionsResult => {
  /** maps `windowId` to pilot session */
  const sessions = new Map<number, PilotSession>()

  const onDeleted = createEventListener<SessionDeletedEventListener>()

  // all messages from the panel app are received here
  // (the port is opened from panel/port.ts)
  chrome.runtime.onConnect.addListener((port) => {
    const windowIdRef: RefObject<number | null> = { current: null }

    if (port.name !== PILOT_PANEL_PORT) {
      return
    }

    port.onMessage.addListener((message: Message) => {
      if (message.type !== PilotMessageType.PILOT_PANEL_OPENED) {
        return
      }

      windowIdRef.current = message.windowId
      console.debug(
        'Sidepanel opened.',
        message.windowId,
        format(new Date(), 'HH:mm:ss'),
      )

      const currentSession = sessions.get(message.windowId)
      const isExistingSessionForTab =
        currentSession != null &&
        message.tabId != null &&
        currentSession.isTracked(message.tabId)

      startPilotSession(sessions, trackRequests, {
        windowId: message.windowId,
        tabId: message.tabId,
      })

      if (message.tabId && !isExistingSessionForTab) {
        reloadTab(message.tabId)
      }
    })

    port.onDisconnect.addListener(() => {
      if (windowIdRef.current == null) {
        return
      }

      const windowId = windowIdRef.current

      console.debug('Sidepanel closed.', windowId)

      const session = sessions.get(windowId)

      if (session) {
        console.debug('stop pilot session', { windowId: windowId })

        session.delete()

        sessions.delete(windowId)

        onDeleted.callListeners(windowId)
      }

      reloadActiveTab()
    })
  })

  chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    withPilotSession(sessions, windowId, (session) => {
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

      if (isCompanionApp(tab.url)) {
        return
      }

      // The update event can be triggered multiple times for the same page load,
      // so the executed content scripts must handle the case that it has already been injected before.
      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['build/inject/contentScript/main.js'],
        injectImmediately: true,
      })
    })
  })

  return {
    withPilotSession: (windowId, callback) =>
      withPilotSession(sessions, windowId, callback),
    getPilotSession: (windowId) => getPilotSession(sessions, windowId),
    onDeleted: onDeleted.toEvent(),
  }
}

type StartPilotSessionOptions = {
  windowId: number
  tabId?: number
}

const startPilotSession = (
  sessions: Sessions,
  trackRequests: TrackRequestsResult,
  { windowId, tabId }: StartPilotSessionOptions,
) => {
  console.debug('start pilot session', { windowId })

  let session = sessions.get(windowId)

  if (session == null) {
    session = new PilotSession(windowId, trackRequests)

    sessions.set(windowId, session)
  }

  if (tabId == null) {
    return session
  }

  session.trackTab(tabId)

  return session
}
