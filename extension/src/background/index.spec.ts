import { chromeMock } from '@/test-utils'
import { randomUUID } from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

vi.mock('./sessionTracking', () => ({
  trackSessions: vi.fn(),
}))

vi.mock('./rpcTracking', () => ({
  trackRequests: vi.fn(),
}))

vi.mock('./simulationTracking', () => ({
  trackSimulations: vi.fn(),
}))

describe('Background script', () => {
  const importModule = () => import(`./index?bust=${randomUUID()}`)

  beforeEach(() => {
    chromeMock.sidePanel.setPanelBehavior.mockResolvedValue()
  })

  it('starts session tracking', async () => {
    expect(trackSessions).not.toHaveBeenCalled()

    await importModule()

    expect(trackSessions).toHaveBeenCalledTimes(1)
  })

  it('starts RPC tracking', async () => {
    expect(trackRequests).not.toHaveBeenCalled()

    await importModule()

    expect(trackRequests).toHaveBeenCalledTimes(1)
  })

  it('tracks simulations', async () => {
    expect(trackSimulations).not.toHaveBeenCalled()

    await importModule()

    expect(trackSimulations).toHaveBeenCalledTimes(1)
  })
})
