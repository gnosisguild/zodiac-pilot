import {
  chromeMock,
  createMockTab,
  mockActiveTab,
  mockRpcRequest,
  startPilotSession,
  startSimulation,
  stopSimulation,
  updateSimulation,
} from '@/test-utils'
import { Chain } from '@zodiac/chains'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRequests } from '../rpcRedirects'
import { trackSessions } from '../sessions'
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
      const tab = createMockTab({ id: 2, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)

      await mockRpcRequest(tab, { chainId: 1, url: 'http://test-url' })

      await startSimulation(tab, { rpcUrl: 'http://test.com' })

      const rules = await chromeMock.declarativeNetRequest.getSessionRules()

      const redirectRule = rules.find(
        (rule) =>
          rule.action.type ===
          chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      )

      expect(redirectRule).toMatchObject({
        action: {
          redirect: { url: 'http://test.com' },
        },
        condition: {
          urlFilter: 'http://test-url',
          tabIds: [2],
        },
      })
    })

    it('removes redirect rules when the simulation stops', async () => {
      const tab = createMockTab({ id: 2, windowId: 1 })

      startPilotSession({ windowId: 1 }, tab)

      await mockRpcRequest(tab, { chainId: 1, url: 'http://test-url' })

      await startSimulation(tab)
      await stopSimulation(tab)

      const rules = await chromeMock.declarativeNetRequest.getSessionRules()
      const redirectRules = rules.filter(
        (rule) =>
          rule.action.type ===
          chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      )

      expect(redirectRules).toEqual([])
    })

    it('removes redirect rules when the pilot session ends', async () => {
      const tab = createMockTab({ id: 2, windowId: 1 })

      const { stopPilotSession } = await startPilotSession({ windowId: 1 }, tab)

      await mockRpcRequest(tab, { chainId: 1, url: 'http://test-url' })

      await startSimulation(tab, { rpcUrl: 'http://rpc.com' })
      await stopPilotSession()

      await expect(
        chromeMock.declarativeNetRequest.getSessionRules(),
      ).resolves.toEqual([])
    })

    it('updates the redirect rules when a new RPC endpoint is detected during simulation', async () => {
      const tab = createMockTab({ id: 1, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)
      await startSimulation(tab, { rpcUrl: 'http://test.com' })

      await mockRpcRequest(tab, { chainId: 1, url: 'http://another-url' })

      const rules = await chromeMock.declarativeNetRequest.getSessionRules()

      const redirectRule = rules.find(
        (rule) =>
          rule.action.type ===
          chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      )

      expect(redirectRule).toMatchObject({
        action: {
          redirect: {
            url: 'http://test.com',
          },
        },
        condition: {
          urlFilter: 'http://another-url',
          tabIds: [1],
        },
      })
    })

    it('updates RPC redirect rules when the rpc URL of a fork changes', async () => {
      const tab = createMockTab({ id: 2, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)
      await startSimulation(tab, { rpcUrl: undefined })

      await mockRpcRequest(tab, { chainId: 1, url: 'http://another-url' })

      await updateSimulation(tab, {
        rpcUrl: 'http://test.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })

      const rules = await chromeMock.declarativeNetRequest.getSessionRules()

      const redirectRule = rules.find(
        (rule) =>
          rule.action.type ===
          chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      )

      expect(redirectRule).toMatchObject({
        action: {
          redirect: {
            url: 'http://test.com',
          },
        },
        condition: {
          urlFilter: 'http://another-url',
          tabIds: [2],
        },
      })
    })

    it('stops updating the redirect rules when the simulation stops', async () => {
      const tab = createMockTab({ id: 1, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)
      await startSimulation(tab)
      await stopSimulation(tab)

      await mockRpcRequest(tab, { chainId: 1, url: 'http://test-url' })

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
      const tab = createMockTab({ id: 1, windowId: 1 })

      const { stopPilotSession } = await startPilotSession({ windowId: 1 }, tab)
      await startSimulation({ windowId: 1 })

      await stopPilotSession()

      await mockRpcRequest(tab, { chainId: 1, url: 'http://test-url' })

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
      const tab = createMockTab({ id: 1, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)

      await startSimulation(tab)

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: '🟢',
        tabId: 1,
      })
    })

    it('updates the badge when a simulation stops', async () => {
      const tab = createMockTab({ id: 1, windowId: 1 })

      await startPilotSession({ windowId: 1 }, tab)

      await startSimulation(tab)
      await stopSimulation(tab)

      expect(chromeMock.action.setBadgeText).toHaveBeenCalledWith({
        text: '',
        tabId: 1,
      })
    })

    it('updates the badge when a session ends', async () => {
      const tab = createMockTab({ id: 1, windowId: 1 })

      const { stopPilotSession } = await startPilotSession({ windowId: 1 }, tab)

      await startSimulation(tab)

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

      const tab = createMockTab({ id: 1, windowId: 1 })

      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })

      expect(handler).toHaveBeenCalledWith({
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
        vnetId: 'test-vnet-id',
      })
    })

    it('emits an event when the simulation ends', async () => {
      const { onSimulationUpdate } = trackSimulations(trackSessionsResult)

      const handler = vi.fn()

      onSimulationUpdate.addListener(handler)

      const tab = createMockTab({ id: 1, windowId: 1 })

      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })
      await stopSimulation(tab)

      expect(handler).toHaveBeenCalledWith(null)
    })

    it('emits an update when the simulation updates', async () => {
      const { onSimulationUpdate } = trackSimulations(trackSessionsResult)

      const handler = vi.fn()

      onSimulationUpdate.addListener(handler)

      const tab = createMockTab({ id: 1, windowId: 1 })

      await startSimulation(tab, {
        chainId: Chain.ETH,
        rpcUrl: 'http://test-rpc.com',
      })
      await updateSimulation(tab, {
        rpcUrl: 'http://new-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })

      expect(handler).toHaveBeenCalledWith({
        chainId: Chain.ETH,
        rpcUrl: 'http://new-rpc.com',
        vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
      })
    })
  })
})
