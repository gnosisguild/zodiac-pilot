import {
  getAvailableChains,
  getChain,
  getTokenBalances,
  isValidToken,
} from '@/balances-server'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { sleepTillIdle } from '@zodiac/test-utils'
import { afterEach, beforeEach, vi } from 'vitest'
import { createMockChain } from './test-utils/createMockChain'

Element.prototype.scrollIntoView = vi.fn()

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})

vi.mock('@/balances-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances-server')>()

  return {
    ...module,

    isValidToken: vi.fn(),
    getTokenBalances: vi.fn(),
    getAvailableChains: vi.fn(),
    getChain: vi.fn(),
  }
})

const mockGetAvailableChains = vi.mocked(getAvailableChains)
const mockGetChain = vi.mocked(getChain)
const mockGetTokenBalances = vi.mocked(getTokenBalances)
const mockIsValidToken = vi.mocked(isValidToken)

beforeEach(() => {
  mockGetAvailableChains.mockResolvedValue([])
  mockGetTokenBalances.mockResolvedValue([])
  mockGetChain.mockResolvedValue(createMockChain())
  mockIsValidToken.mockResolvedValue(true)
})
