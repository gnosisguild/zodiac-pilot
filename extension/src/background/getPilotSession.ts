import { invariant } from '@epic-web/invariant'
import { PilotSession } from './PilotSession'
import { Sessions } from './types'

export const getPilotSession = (
  sessions: Sessions,
  windowId: number
): PilotSession => {
  const session = sessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return session
}
