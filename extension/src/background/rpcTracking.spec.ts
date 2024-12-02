import { mockRpcRequest, startPilotSession } from '@/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'

describe('RPC Tracking', () => {
  it('notifies when a new network has been tracked', async () => {
    const result = trackRequests()
    trackSessions(result)

    await startPilotSession({ windowId: 1, tabId: 1 })
    const handler = vi.fn()

    result.onNewRpcEndpointDetected.addListener(handler)

    await mockRpcRequest({
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

    result.onNewRpcEndpointDetected.addListener(handler)
    result.onNewRpcEndpointDetected.removeListener(handler)

    await mockRpcRequest({
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

    result.onNewRpcEndpointDetected.addListener(handler)
    result.onNewRpcEndpointDetected.removeAllListeners()

    await mockRpcRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
