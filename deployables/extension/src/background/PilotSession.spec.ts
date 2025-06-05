import { Chain } from '@zodiac/chains'
import { describe, expect, it, vi } from 'vitest'
import { PilotSession } from './PilotSession'
import { trackRequests } from './rpcRedirects'

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
    await session.updateFork({
      rpcUrl: 'http://new-rpc.com',
      vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
    })

    expect(handleForkUpdate).toHaveBeenCalledWith({
      ...fork,
      rpcUrl: 'http://new-rpc.com',
      vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
    })
  })

  it('emits an event when the fork is removed', async () => {
    const session = new PilotSession(windowId, trackRequestsResult)

    const handleForkUpdate = vi.fn()

    session.on('forkUpdated', handleForkUpdate)

    const fork = {
      chainId: Chain.ETH,
      rpcUrl: 'http://test-rpc.com',
      vnetId: 'df87555f-93d3-4cbc-9e6c-8248e8ffb13f',
    }

    await session.createFork(fork)
    await session.clearFork()

    expect(handleForkUpdate).toHaveBeenCalledWith(null)
  })
})
