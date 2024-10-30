import { invariant } from '@epic-web/invariant'
import { Fork, ForkedSession, PilotSession } from './types'

/** maps `windowId` to pilot session */
const activePilotSessions = new Map<number, PilotSession>()

type ActionablePilotSession = Readonly<PilotSession> & {
  delete: () => void

  isTracked: (tabId: number) => boolean
  trackTab: (tabId: number) => void
  untrackTab: (tabId: number) => void

  createFork: (fork: Fork) => Fork
  clearFork: () => void
}

type CallbackFn = (session: ActionablePilotSession) => void

export const withPilotSession = (windowId: number, callback: CallbackFn) => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return
  }

  callback(makeActionable(session))
}

export const getPilotSession = (windowId: number): ActionablePilotSession => {
  const session = activePilotSessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return makeActionable(session)
}

export const getOrCreatePilotSession = (
  windowId: number
): ActionablePilotSession => {
  let session = activePilotSessions.get(windowId)

  if (session == null) {
    session = createPilotSession(windowId)
  }

  return makeActionable(session)
}

const makeActionable = (session: PilotSession): ActionablePilotSession => ({
  ...session,

  isTracked: (tabId) => session.tabs.has(tabId),
  trackTab: (tabId) => session.tabs.add(tabId),
  untrackTab: (tabId) => session.tabs.delete(tabId),

  delete: () => activePilotSessions.delete(session.id),

  createFork: (fork) => {
    session.fork = fork

    return fork
  },
  clearFork: () => {
    session.fork = null
  },
})

export const getTrackedTabs = () =>
  Array.from(activePilotSessions.values()).flatMap(({ tabs }) =>
    Array.from(tabs)
  )

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
  windowId: number
): ActionablePilotSession => {
  const session = {
    id: windowId,
    fork: null,
    tabs: new Set<number>(),
  }

  activePilotSessions.set(windowId, session)

  return makeActionable(session)
}

export const hasFork = (windowId: number) => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return false
  }

  return session.fork != null
}

export const getForkedSessions = (): ForkedSession[] =>
  Array.from(activePilotSessions.values()).filter(isForkedSession)

const isForkedSession = (session: PilotSession): session is ForkedSession =>
  session.fork != null

export const clearAllSessions = () => activePilotSessions.clear()
