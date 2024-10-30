import { chromeMock, mockRPCRequest, startPilotSession } from '@/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { Message, SIMULATE_START } from '../messages'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

describe('Simulation tracking', () => {
  type StartSimulationOptions = {
    windowId: number
  }

  const startSimulation = ({ windowId }: StartSimulationOptions) => {
    chromeMock.runtime.onMessage.callListeners(
      {
        type: SIMULATE_START,
        windowId,
        networkId: 1,
        rpcUrl: 'http://test.com',
      } satisfies Message,
      { id: chrome.runtime.id },
      () => {}
    )
  }

  beforeEach(() => {
    trackSessions()
    trackRequests()
    trackSimulations()
  })

  describe('RPC redirect rules', () => {
    it('sets up redirect rules when a simulation starts', async () => {
      startPilotSession({ windowId: 1, tabId: 2 })

      await mockRPCRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      startSimulation({ windowId: 1 })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: [
            {
              id: 2,
              priority: 1,
              action: {
                type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
                redirect: { url: 'http://test.com' },
              },
              condition: {
                resourceTypes: [
                  chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                ],
                regexFilter: '^(http:\\/\\/test\\-url)$',
                tabIds: [2],
              },
            },
          ],
        })
      )
    })
  })
})
