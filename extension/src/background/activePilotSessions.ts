import { invariant } from '@epic-web/invariant'
import { PilotSession } from './PilotSession'
import { TrackRequestsResult } from './rpcTracking'

/** maps `windowId` to pilot session */
const activePilotSessions = new Map<number, PilotSession>()

type PublicPilotSession = Omit<PilotSession, 'delete'>
type CallbackFn = (session: PublicPilotSession) => void

export const withPilotSession = (
  windowId: number,
  callback: CallbackFn
): Promise<void> => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return Promise.resolve()
  }

  return Promise.resolve(callback(session))
}

export const getPilotSession = (windowId: number): PilotSession => {
  const session = activePilotSessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return session
}

export const getOrCreatePilotSession = (
  trackRequests: TrackRequestsResult,
  windowId: number
): PilotSession => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return createPilotSession(trackRequests, windowId)
  }

  return session
}

type IsTrackedTabOptions = {
  windowId?: number
  tabId: number
}

export const isTrackedTab = ({ windowId, tabId }: IsTrackedTabOptions) => {
  if (windowId == null) {
    return Array.from(activePilotSessions.values()).some(({ tabs }) =>
      tabs.has(tabId)
    )
  }

  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return false
  }

  return session.tabs.has(tabId)
}

export const createPilotSession = (
  trackRequests: TrackRequestsResult,
  windowId: number
): PilotSession => {
  const session = new PilotSession(windowId, trackRequests)

  activePilotSessions.set(windowId, session)

  return session
}

export const deletePilotSession = async (windowId: number) => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return
  }

  await session.delete()

  activePilotSessions.delete(windowId)
}

export const clearAllSessions = () => activePilotSessions.clear()
