import { PilotSession, type Sessions } from './PilotSession'

type PublicPilotSession = Omit<PilotSession, 'delete'>
export type CallbackFn = (session: PublicPilotSession) => void

export const withPilotSession = (
  sessions: Sessions,
  windowId: number,
  callback: CallbackFn,
): Promise<void> => {
  const session = sessions.get(windowId)

  if (session == null) {
    return Promise.resolve()
  }

  return Promise.resolve(callback(session))
}
