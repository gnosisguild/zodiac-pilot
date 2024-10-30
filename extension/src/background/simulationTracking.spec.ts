import {
  chromeMock,
  mockRPCRequest,
  startPilotSession,
  startSimulation,
  stopSimulation,
} from '@/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

describe('Simulation tracking', () => {
  beforeAll(() => {
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

    it('removes redirect rules when the simulation stops', async () => {
      startPilotSession({ windowId: 1, tabId: 2 })

      await mockRPCRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      startSimulation({ windowId: 1 })
      stopSimulation({ windowId: 1 })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenLastCalledWith({
        addRules: [],
        removeRuleIds: [2],
      })
    })

    it('removes redirect rules when the pilot session ends', async () => {
      const { stopPilotSession } = startPilotSession({ windowId: 1, tabId: 2 })

      await mockRPCRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      startSimulation({ windowId: 1 })
      stopPilotSession()

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenLastCalledWith({
        removeRuleIds: [2],
      })
    })
  })
})
