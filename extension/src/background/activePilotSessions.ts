import { Message, PilotMessageType } from '@/messages'
import { sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { removeCSPHeaderRule, updateCSPHeaderRule } from './cspHeaderRule'
import {
  removeAllRpcRedirectRules,
  updateRpcRedirectRules,
} from './rpcRedirect'
import { TrackRequestsResult } from './rpcTracking'
import { updateSimulatingBadge } from './simulationTracking'
import { Fork, ForkedSession, PilotSession } from './types'

/** maps `windowId` to pilot session */
const activePilotSessions = new Map<number, ActionablePilotSession>()

type ActionablePilotSession<S extends PilotSession = PilotSession> =
  Readonly<S> & {
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

  callback(session)
}

export const getPilotSession = (windowId: number): ActionablePilotSession => {
  const session = activePilotSessions.get(windowId)

  invariant(session != null, `No session found for windowId "${windowId}"`)

  return session
}

export const getOrCreatePilotSession = (
  trackRequests: TrackRequestsResult,
  windowId: number
): ActionablePilotSession => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return createPilotSession(trackRequests, windowId)
  }

  return session
}

const makeActionable = (
  session: PilotSession,
  { onNewRPCEndpointDetected, getTrackedRPCUrlsForChainId }: TrackRequestsResult
): ActionablePilotSession => {
  const handleNewRPCEndpoint = () => {
    if (actionableSession.fork == null) {
      return
    }

    updateRpcRedirectRules(
      getForkedSessions(),
      getTrackedRPCUrlsForChainId({ chainId: actionableSession.fork.chainId })
    )
  }

  const actionableSession = {
    ...session,

    isTracked: (tabId) => session.tabs.has(tabId),
    trackTab: (tabId) => {
      session.tabs.add(tabId)

      updateCSPHeaderRule(session.tabs)

      sendMessageToTab(tabId, {
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

        sendMessageToTab(tabId, {
          type: PilotMessageType.PILOT_DISCONNECT,
        })
      }

      removeCSPHeaderRule()
      removeAllRpcRedirectRules()
    },

    createFork: (fork) => {
      actionableSession.fork = fork

      updateRpcRedirectRules(
        getForkedSessions(),
        getTrackedRPCUrlsForChainId({ chainId: fork.chainId })
      )

      onNewRPCEndpointDetected.addListener(handleNewRPCEndpoint)

      return fork
    },
    clearFork: () => {
      if (actionableSession.fork == null) {
        return
      }

      const { chainId } = actionableSession.fork

      Object.assign(actionableSession, { fork: null })

      updateRpcRedirectRules(
        getForkedSessions(),
        getTrackedRPCUrlsForChainId({ chainId })
      )

      onNewRPCEndpointDetected.removeListener(handleNewRPCEndpoint)
    },
  } satisfies ActionablePilotSession

  return actionableSession
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
): ActionablePilotSession => {
  const session = {
    id: windowId,
    fork: null,
    tabs: new Set<number>(),
  }

  const actionablePilotSession = makeActionable(session, trackRequests)

  activePilotSessions.set(windowId, actionablePilotSession)

  return actionablePilotSession
}

const getForkedSessions = (): ForkedSession[] =>
  Array.from(activePilotSessions.values()).filter(isForkedSession)

const isForkedSession = (
  session: PilotSession
): session is ActionablePilotSession<ForkedSession> => session.fork != null

export const clearAllSessions = () => activePilotSessions.clear()
