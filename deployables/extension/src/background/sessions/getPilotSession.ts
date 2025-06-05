import { invariant } from '@epic-web/invariant'
import { PilotSession, type Sessions } from './PilotSession'

export const getPilotSession = (
  sessions: Sessions,
  windowId: number,
): PilotSession => {
  const session = sessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return session
}
