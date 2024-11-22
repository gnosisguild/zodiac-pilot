import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import {
  callListeners,
  chromeMock,
  mockActiveTab,
  mockRPCRequest,
  startPilotSession,
  startSimulation,
  stopSimulation,
} from '@/test-utils'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { clearAllSessions } from './activePilotSessions'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

describe('Simulation tracking', () => {
  beforeAll(() => {
    const trackRequestsResult = trackRequests()
    trackSessions(trackRequestsResult)
    trackSimulations()
  })

  beforeEach(() => {
    clearAllSessions()
    mockActiveTab()
  })

  describe('RPC redirect rules', () => {
    it('sets up redirect rules when a simulation starts', async () => {
      await startPilotSession({ windowId: 1, tabId: 2 })

      await mockRPCRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      await startSimulation({ windowId: 1 })

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

      await startSimulation({ windowId: 1 })
      await stopSimulation({ windowId: 1 })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenLastCalledWith({
        removeRuleIds: [2],
      })
    })

    it('removes redirect rules when the pilot session ends', async () => {
      const { stopPilotSession } = await startPilotSession({
        windowId: 1,
        tabId: 2,
      })

      await mockRPCRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      await startSimulation({ windowId: 1 })
      await stopPilotSession()

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenLastCalledWith({
        removeRuleIds: [2],
      })
    })

    it('updates the redirect rules when a new RPC endpoint is detected during simulation', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })
      await startSimulation({ windowId: 1 })

      await mockRPCRequest({ tabId: 1, chainId: 1, url: 'http://another-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: [
            {
              id: 1,
              priority: 1,
              action: {
                type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
                redirect: { url: 'http://test.com' },
              },
              condition: {
                resourceTypes: [
                  chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                ],
                regexFilter: '^(http:\\/\\/another\\-url)$',
                tabIds: [1],
              },
            },
          ],
        })
      )
    })

    it('stops updating the redirect rules when the simulation stops', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })
      await startSimulation({ windowId: 1 })
      await stopSimulation({ windowId: 1 })

      await mockRPCRequest({ tabId: 1, chainId: 1, url: 'http://test-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).not.toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: [
            {
              id: 1,
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
                tabIds: [1],
              },
            },
          ],
        })
      )
    })

    it('stops updating the redirect rules when the session ends', async () => {
      const { stopPilotSession } = await startPilotSession({
        windowId: 1,
        tabId: 1,
      })
      await startSimulation({ windowId: 1 })

      await stopPilotSession()

      await mockRPCRequest({ tabId: 1, chainId: 1, url: 'http://test-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules
      ).not.toHaveBeenCalledWith(
        expect.objectContaining({
          addRules: [
            {
              id: 1,
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
                tabIds: [1],
              },
            },
          ],
        })
      )
    })
  })

  describe('Pilot sessions', () => {
    it('does not break when a simulation is stopped outside of an active pilot session', async () => {
      await expect(
        callListeners(
          chromeMock.runtime.onMessage,
          {
            type: PilotSimulationMessageType.SIMULATE_STOP,
            windowId: 1,
          } satisfies SimulationMessage,
          { id: chromeMock.runtime.id },
          () => {}
        )
      ).resolves.not.toThrow()
    })
  })
})
