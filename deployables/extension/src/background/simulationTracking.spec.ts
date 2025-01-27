import {
  chromeMock,
  mockActiveTab,
  mockRpcRequest,
  startPilotSession,
  startSimulation,
  stopSimulation,
  updateSimulation,
} from '@/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
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
})
