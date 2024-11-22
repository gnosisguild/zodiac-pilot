import { mockRPCRequest, startPilotSession } from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'

describe('RPC Tracking', () => {
  it('notifies when a new network has been tracked', async () => {
    const result = trackRequests()
    trackSessions(result)

    await startPilotSession({ windowId: 1, tabId: 1 })
    const handler = vi.fn()

    result.onNewRPCEndpointDetected.addListener(handler)

    await mockRPCRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).toHaveBeenCalled()
  })

  it('is possible to stop getting notified', async () => {
    const result = trackRequests()
    trackSessions(result)

    await startPilotSession({ windowId: 1, tabId: 1 })

    const handler = vi.fn()

    result.onNewRPCEndpointDetected.addListener(handler)
    result.onNewRPCEndpointDetected.removeListener(handler)

    await mockRPCRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('is possible to remove all listeners', async () => {
    const result = trackRequests()
    trackSessions(result)

    await startPilotSession({ windowId: 1, tabId: 1 })

    const handler = vi.fn()

    result.onNewRPCEndpointDetected.addListener(handler)
    result.onNewRPCEndpointDetected.removeAllListeners()

    await mockRPCRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
