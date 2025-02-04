import { Chain } from '@zodiac/chains'
import { describe, expect, it, vi } from 'vitest'
import { PilotSession } from './PilotSession'
import { trackRequests } from './rpcTracking'

describe('Pilot Session', () => {
  const trackRequestsResult = trackRequests()
  const windowId = 1

  it('emits and event when a fork is created', async () => {
    const session = new PilotSession(windowId, trackRequestsResult)

    const handleForkUpdate = vi.fn()

    session.on('forkUpdated', handleForkUpdate)

    const fork = {
      chainId: Chain.ETH,
      rpcUrl: 'http://test-rpc.com',
    }

    await session.createFork(fork)

    expect(handleForkUpdate).toHaveBeenCalledWith(fork)
  })

  it('emits an event when a fork is updated', async () => {
    const session = new PilotSession(windowId, trackRequestsResult)

    const handleForkUpdate = vi.fn()

    session.on('forkUpdated', handleForkUpdate)

    const fork = {
      chainId: Chain.ETH,
      rpcUrl: 'http://test-rpc.com',
    }

    await session.createFork(fork)
    await session.updateFork('http://new-rpc.com')

    expect(handleForkUpdate).toHaveBeenCalledWith({
      ...fork,
      rpcUrl: 'http://new-rpc.com',
    })
  })

  it('emits an event when the fork is removed', async () => {
    const session = new PilotSession(windowId, trackRequestsResult)

    const handleForkUpdate = vi.fn()

    session.on('forkUpdated', handleForkUpdate)

    const fork = {
      chainId: Chain.ETH,
      rpcUrl: 'http://test-rpc.com',
    }

    await session.createFork(fork)
    await session.clearFork()

    expect(handleForkUpdate).toHaveBeenCalledWith(null)
  })
})
