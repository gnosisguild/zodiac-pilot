import { COMPANION_APP_PORT } from '@/port-handling'
import {
  callListeners,
  chromeMock,
  connectCompanionApp,
  createMockPort,
  createMockTab,
  startPilotSession,
  startSimulation,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
  type Message,
} from '@zodiac/messages'
import { mockActiveTab, mockTab } from '@zodiac/test-utils/chrome'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { companionEnablement } from './companionEnablement'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

describe('Companion Enablement', () => {
  beforeEach(() => {
    const trackRequestsResult = trackRequests()
    const trackSessionsResult = trackSessions(trackRequestsResult)
    const trackSimulationsResult = trackSimulations(trackSessionsResult)

    companionEnablement(trackSessionsResult, trackSimulationsResult)
  })

  describe('Fork updates', () => {
    it('notifies the companion app about fork updates', async () => {
      await startPilotSession({ windowId: 1, tabId: 2 })

      await connectCompanionApp({ id: 2, windowId: 1 })

      await startSimulation({
        windowId: 1,
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: CompanionAppMessageType.FORK_UPDATED,
        forkUrl: 'http://test-rpc.com',
      })
    })

    it('notifies the companion app about forks even when the simulation is already running', async () => {
      await startPilotSession({ windowId: 1, tabId: 2 })
      await startSimulation({
        windowId: 1,
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })

      await connectCompanionApp({ id: 2, windowId: 1 })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: CompanionAppMessageType.FORK_UPDATED,
        forkUrl: 'http://test-rpc.com',
      })
    })
  })

  describe('Connection status', () => {
    it('answers pings from the companion app', async () => {
      await callListeners(
        chromeMock.runtime.onConnect,
        createMockPort({ name: COMPANION_APP_PORT }),
      )

      const tab = mockTab(createMockTab())

      await callListeners(
        chromeMock.runtime.onMessage,
        { type: CompanionAppMessageType.PING } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
        type: PilotMessageType.PONG,
      } satisfies Message)
    })

    it('stops answering pings when the port disconnects', async () => {
      const port = createMockPort({ name: COMPANION_APP_PORT })

      await callListeners(chromeMock.runtime.onConnect, port)

      const tab = mockActiveTab(createMockTab())

      await callListeners(port.onDisconnect, port)

      await callListeners(
        chromeMock.runtime.onMessage,
        { type: CompanionAppMessageType.PING } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith(tab.id, {
        type: PilotMessageType.PONG,
      } satisfies Message)
    })

    it('sends a disconnect message when the port closes', async () => {
      const port = createMockPort({ name: COMPANION_APP_PORT })

      await callListeners(chromeMock.runtime.onConnect, port)

      const tab = mockActiveTab(createMockTab())

      await callListeners(port.onDisconnect, port)

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
        type: PilotMessageType.PILOT_DISCONNECT,
      } satisfies Message)
    })
  })
})
