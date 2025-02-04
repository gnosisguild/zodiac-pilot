import {
  chromeMock,
  connectCompanionApp,
  startPilotSession,
  startSimulation,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { CompanionAppMessageType } from '@zodiac/messages'
import { beforeEach, describe, expect, it } from 'vitest'
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
