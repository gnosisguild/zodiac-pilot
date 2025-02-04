import {
  chromeMock,
  mockActiveTab,
  mockRpcRequest,
  startPilotSession,
  startSimulation,
  stopSimulation,
  updateSimulation,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

describe('Simulation tracking', () => {
  beforeEach(() => {
    const trackRequestsResult = trackRequests()
    const trackSessionsResult = trackSessions(trackRequestsResult)
    trackSimulations(trackSessionsResult)

    mockActiveTab({ id: 1 })
  })

  describe('RPC redirect rules', () => {
    it('sets up redirect rules when a simulation starts', async () => {
      await startPilotSession({ windowId: 1, tabId: 2 })

      await mockRpcRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      await startSimulation({ windowId: 1, rpcUrl: 'http://test.com' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
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
        }),
        expect.anything(),
      )
    })

    it('removes redirect rules when the simulation stops', async () => {
      startPilotSession({ windowId: 1, tabId: 2 })

      await mockRpcRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      await startSimulation({ windowId: 1 })
      await stopSimulation({ windowId: 1 })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
      ).toHaveBeenLastCalledWith(
        {
          removeRuleIds: [2],
        },
        expect.anything(),
      )
    })

    it('removes redirect rules when the pilot session ends', async () => {
      const { stopPilotSession } = await startPilotSession({
        windowId: 1,
        tabId: 2,
      })

      await mockRpcRequest({ tabId: 2, chainId: 1, url: 'http://test-url' })

      await startSimulation({ windowId: 1 })
      await stopPilotSession()

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
      ).toHaveBeenLastCalledWith(
        {
          removeRuleIds: [2],
        },
        expect.anything(),
      )
    })

    it('updates the redirect rules when a new RPC endpoint is detected during simulation', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })
      await startSimulation({ windowId: 1, rpcUrl: 'http://test.com' })

      await mockRpcRequest({ tabId: 1, chainId: 1, url: 'http://another-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
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
        }),
        expect.anything(),
      )
    })

    it('updates RPC redirect rules when the rpc URL of a fork changes', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })
      await startSimulation({ windowId: 1, rpcUrl: undefined })

      await mockRpcRequest({ tabId: 1, chainId: 1, url: 'http://another-url' })

      await updateSimulation({ windowId: 1, rpcUrl: 'http://test.com' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
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
        }),
        expect.anything(),
      )
    })

    it('stops updating the redirect rules when the simulation stops', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })
      await startSimulation({ windowId: 1 })
      await stopSimulation({ windowId: 1 })

      await mockRpcRequest({ tabId: 1, chainId: 1, url: 'http://test-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
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
        }),
      )
    })

    it('stops updating the redirect rules when the session ends', async () => {
      const { stopPilotSession } = await startPilotSession({
        windowId: 1,
        tabId: 1,
      })
      await startSimulation({ windowId: 1 })

      await stopPilotSession()

      await mockRpcRequest({ tabId: 1, chainId: 1, url: 'http://test-url' })

      expect(
        chromeMock.declarativeNetRequest.updateSessionRules,
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
        }),
      )
    })
  })

  describe('Pilot sessions', () => {
    it('does not break when a simulation is stopped outside of an active pilot session', async () => {
      await expect(stopSimulation({ windowId: 1 })).resolves.not.toThrow()
    })

    it('stopping a simulation when none was started is a no-op', async () => {
      await startPilotSession({ windowId: 1 })

      await expect(stopSimulation({ windowId: 1 })).resolves.not.toThrow()
    })
  })

  describe('Badge', () => {
    it('updates the badge when a simulation starts', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })

      await startSimulation({ windowId: 1 })

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: '🟢',
        tabId: 1,
      })
    })

    it('updates the badge when a simulation stops', async () => {
      await startPilotSession({ windowId: 1, tabId: 1 })

      await startSimulation({ windowId: 1 })
      await stopSimulation({ windowId: 1 })

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: '',
        tabId: 1,
      })
    })

    it('updates the badge when a session ends', async () => {
      const { stopPilotSession } = await startPilotSession({
        windowId: 1,
        tabId: 1,
      })

      await startSimulation({ windowId: 1 })

      await stopPilotSession()

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: '',
        tabId: 1,
      })
    })
  })

  describe('Events', () => {
    const trackRequestsResult = trackRequests()
    const trackSessionsResult = trackSessions(trackRequestsResult)

    beforeEach(async () => {
      await startPilotSession({ windowId: 1 })
    })

    afterEach(async () => {
      await stopSimulation({ windowId: 1 })
    })

    it('emits an event when a simulation starts', async () => {
      const { onSimulationUpdate } = trackSimulations(trackSessionsResult)

      const handler = vi.fn()

      onSimulationUpdate.addListener(handler)

      await startSimulation({
        windowId: 1,
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })

      expect(handler).toHaveBeenCalledWith({
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })
    })

    it('emits an event when the simulation ends', async () => {
      const { onSimulationUpdate } = trackSimulations(trackSessionsResult)

      const handler = vi.fn()

      onSimulationUpdate.addListener(handler)

      await startSimulation({
        windowId: 1,
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })
      await stopSimulation({ windowId: 1 })

      expect(handler).toHaveBeenCalledWith(null)
    })

    it('emits an update when the simulation updates', async () => {
      const { onSimulationUpdate } = trackSimulations(trackSessionsResult)

      const handler = vi.fn()

      onSimulationUpdate.addListener(handler)

      await startSimulation({
        windowId: 1,
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })
      await updateSimulation({ windowId: 1, rpcUrl: 'http://new-rpc.com' })

      expect(handler).toHaveBeenCalledWith({
        chainId: Chain.ETH,
        rpcUrl: 'http://new-rpc.com',
      })
    })
  })
})
