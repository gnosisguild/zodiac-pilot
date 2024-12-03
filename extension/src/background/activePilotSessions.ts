import { invariant } from '@epic-web/invariant'
import { PilotSession } from './PilotSession'
import { TrackRequestsResult } from './rpcTracking'

type PublicPilotSession = Omit<PilotSession, 'delete'>
export type CallbackFn = (session: PublicPilotSession) => void

export type Sessions = Map<number, PilotSession>

export const withPilotSession = (
  sessions: Sessions,
  windowId: number,
  callback: CallbackFn
): Promise<void> => {
  const session = sessions.get(windowId)

  if (session == null) {
    return Promise.resolve()
  }

  return Promise.resolve(callback(session))
}

export const getPilotSession = (
  sessions: Sessions,
  windowId: number
): PilotSession => {
  const session = sessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return session
}

export const createPilotSession = (
  trackRequests: TrackRequestsResult,
  windowId: number
): PilotSession => {
  const session = new PilotSession(windowId, trackRequests)

  return session
}
