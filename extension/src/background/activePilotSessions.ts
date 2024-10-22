import { PilotSession } from './types'

/** maps `windowId` to pilot session */
export const activePilotSessions = new Map<number, PilotSession>()
