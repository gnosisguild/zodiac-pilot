import { mockRPCRequest, startPilotSession } from '@/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'

describe('RPC Tracking', () => {
  beforeEach(() => {
    trackSessions()
  })

  it('notifies when a new network has been tracked', async () => {
    await startPilotSession({ windowId: 1, tabId: 1 })

    const { onNewRPCEndpointDetected } = trackRequests()

    const handler = vi.fn()

    onNewRPCEndpointDetected.addListener(handler)

    await mockRPCRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).toHaveBeenCalled()
  })

  it('is possible to stop getting notified', async () => {
    await startPilotSession({ windowId: 1, tabId: 1 })

    const { onNewRPCEndpointDetected } = trackRequests()

    const handler = vi.fn()

    onNewRPCEndpointDetected.addListener(handler)
    onNewRPCEndpointDetected.removeListener(handler)

    await mockRPCRequest({
      chainId: 1,
      tabId: 1,
      url: 'http://test-json-rpc.com',
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
