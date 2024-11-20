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

type Session = [pilotSession: PilotSession, trackRequests: TrackRequestsResult]

/** maps `windowId` to pilot session */
const activePilotSessions = new Map<number, Session>()

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
  trackRequests: TrackRequestsResult,
  windowId: number
): ActionablePilotSession => {
  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return createPilotSession(trackRequests, windowId)
  }

  return makeActionable(session)
}

const makeActionable = ([
  session,
  { onNewRPCEndpointDetected, getTrackedRPCUrlsForChainId },
]: Session): ActionablePilotSession => {
  const handleNewRPCEndpoint = () => {
    if (session.fork == null) {
      return
    }

    updateRpcRedirectRules(
      getForkedSessions(),
      getTrackedRPCUrlsForChainId({ chainId: session.fork.chainId })
    )
  }

  return {
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
      session.fork = fork

      updateRpcRedirectRules(
        getForkedSessions(),
        getTrackedRPCUrlsForChainId({ chainId: fork.chainId })
      )

      onNewRPCEndpointDetected.addListener(handleNewRPCEndpoint)

      return fork
    },
    clearFork: () => {
      if (session.fork == null) {
        return
      }

      const { chainId } = session.fork

      Object.assign(session, { fork: null })

      updateRpcRedirectRules(
        getForkedSessions(),
        getTrackedRPCUrlsForChainId({ chainId })
      )

      onNewRPCEndpointDetected.removeListener(handleNewRPCEndpoint)
    },
  }
}

type IsTrackedTabOptions = {
  windowId?: number
  tabId: number
}

export const isTrackedTab = ({ windowId, tabId }: IsTrackedTabOptions) => {
  if (windowId == null) {
    return Array.from(activePilotSessions.values()).some(([{ tabs }]) =>
      tabs.has(tabId)
    )
  }

  const session = activePilotSessions.get(windowId)

  if (session == null) {
    return false
  }

  const [pilotSession] = session

  return pilotSession.tabs.has(tabId)
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

  activePilotSessions.set(windowId, [session, trackRequests])

  return makeActionable([session, trackRequests])
}

const getForkedSessions = (): ForkedSession[] =>
  Array.from(activePilotSessions.values())
    .map(([pilotSession]) => pilotSession)
    .filter(isForkedSession)

const isForkedSession = (session: PilotSession): session is ForkedSession =>
  session.fork != null

export const clearAllSessions = () => activePilotSessions.clear()
