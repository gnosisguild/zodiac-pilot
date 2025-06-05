import { COMPANION_APP_PORT } from '@/port-handling'
import {
  callListeners,
  chromeMock,
  connectCompanionApp,
  createMockPort,
  createMockTab,
  mockRoute,
  mockRoutes,
  startPilotSession,
  startSimulation,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { mockActiveTab, mockTab, mockTabClose } from '@zodiac/test-utils/chrome'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { companionEnablement } from './companionEnablement'
import { trackRequests } from './rpcRedirects'
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
      const tab = createMockTab({ id: 2, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)

      await connectCompanionApp(tab)

      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: CompanionResponseMessageType.FORK_UPDATED,
        forkUrl: 'http://test-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })
    })

    it('notifies the companion app about forks even when the simulation is already running', async () => {
      const tab = createMockTab({ id: 2, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)
      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })

      await connectCompanionApp(tab)

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(2, {
        type: CompanionResponseMessageType.FORK_UPDATED,
        forkUrl: 'http://test-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })
    })

    it('does not notify the companion app when the tab has been closed', async () => {
      const tab = createMockTab({ id: 2, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)

      await connectCompanionApp(tab)

      await mockTabClose(tab.id)

      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledTimes(1)
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
        {
          type: CompanionAppMessageType.PING,
          signedIn: false,
        } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
        type: CompanionResponseMessageType.PONG,
        lastTransactionExecutedAt: null,
      } satisfies CompanionResponseMessage)
    })

    it('stops answering pings when the port disconnects', async () => {
      const port = createMockPort({ name: COMPANION_APP_PORT })

      await callListeners(chromeMock.runtime.onConnect, port)

      const tab = mockActiveTab(createMockTab())

      await callListeners(port.onDisconnect, port)

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.PING,
          signedIn: false,
        } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).not.toHaveBeenCalledWith(tab.id, {
        type: CompanionResponseMessageType.PONG,
        lastTransactionExecutedAt: null,
      } satisfies CompanionResponseMessage)
    })
  })

  describe('List routes', () => {
    it('is possible to get stored routes', async () => {
      const tab = mockActiveTab(createMockTab())
      const route = await mockRoute()

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.REQUEST_ROUTES,
        } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
        type: CompanionResponseMessageType.LIST_ROUTES,
        routes: [route],
      } satisfies CompanionResponseMessage)
    })

    it('is possible to get a single route', async () => {
      const tab = mockActiveTab(createMockTab())
      const [route] = await mockRoutes(
        { id: 'first-route' },
        { id: 'another-route' },
      )

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.REQUEST_ROUTE,
          routeId: route.id,
        } satisfies CompanionAppMessage,
        { tab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(tab.id, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      } satisfies CompanionResponseMessage)
    })
  })
})
