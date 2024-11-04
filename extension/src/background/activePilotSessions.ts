import { Message, PilotMessageType } from '@/messages'
import { sendTabMessage } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { removeCSPHeaderRule, updateCSPHeaderRule } from './cspHeaderRule'
import {
  removeAllRpcRedirectRules,
  updateRpcRedirectRules,
} from './rpcRedirect'
import { updateSimulatingBadge } from './simulationTracking'
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
  trackTab: (tabId) => {
    session.tabs.add(tabId)

    updateCSPHeaderRule(session.tabs)

    sendTabMessage(tabId, {
      type: PilotMessageType.PILOT_CONNECT,
    } satisfies Message)
  },
  untrackTab: (tabId) => {
    session.tabs.delete(tabId)

    updateCSPHeaderRule(session.tabs)
  },

  delete: () => {
    activePilotSessions.delete(session.id)

    for (const tabId of session.tabs) {
      updateSimulatingBadge({ windowId: session.id, isSimulating: false })

      sendTabMessage(tabId, {
        type: PilotMessageType.PILOT_DISCONNECT,
      })
    }

    removeCSPHeaderRule()
    removeAllRpcRedirectRules()
  },

  createFork: (fork) => {
    session.fork = fork

    updateRpcRedirectRules(getForkedSessions())

    return fork
  },
  clearFork: () => {
    session.fork = null

    updateRpcRedirectRules(getForkedSessions())
  },
})

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

const getForkedSessions = (): ForkedSession[] =>
  Array.from(activePilotSessions.values()).filter(isForkedSession)

const isForkedSession = (session: PilotSession): session is ForkedSession =>
  session.fork != null

export const clearAllSessions = () => activePilotSessions.clear()
