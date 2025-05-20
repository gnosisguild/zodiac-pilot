import {
  getAvailableChains,
  getChain,
  getTokenBalances,
  getTokenByAddress,
  isValidToken,
} from '@/balances-server'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { sleepTillIdle } from '@zodiac/test-utils'
import {
  configMocks,
  mockAnimationsApi,
  mockResizeObserver,
  mockViewport,
} from 'jsdom-testing-mocks'
import { afterAll, afterEach, beforeEach, vi } from 'vitest'
import { createMockListResult } from './test-utils'
import { createMockChain } from './test-utils/createMockChain'
import { createMockToken } from './test-utils/createMockToken'

configMocks({ afterEach, afterAll })

mockAnimationsApi()
mockResizeObserver()
mockViewport({ width: 1024, height: 768 })

Element.prototype.scrollIntoView = vi.fn()

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getAdminOrganizationId: vi.fn(),
  }
})

vi.mock('@/simulation-server', async () => {
  const actual = await vi.importActual<typeof import('@/simulation-server')>(
    '@/simulation-server',
  )
  return {
    ...actual,
    simulateBundleTransaction: vi.fn(async () => {
      return {
        simulation_results: [
          {
            transaction: {
              network_id: '1',
              transaction_info: {
                asset_changes: [],
              },
            },
          },
        ],
      }
    }),
  }
})

vi.mock('@/balances-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/balances-server')>()

  return {
    ...module,

    isValidToken: vi.fn(),
    getTokenBalances: vi.fn(),
    getTokenDetails: vi.fn(),
    getAvailableChains: vi.fn(),
    getTokenByAddress: vi.fn(),
    getChain: vi.fn(),
  }
})

vi.mock('@workos-inc/authkit-react-router', async (importOriginal) => {
  const module =
    await importOriginal<typeof import('@workos-inc/authkit-react-router')>()

  const listUsers = vi.fn()

  return {
    ...module,
    authkitLoader: vi.fn(),
    getSignInUrl: vi.fn().mockResolvedValue('http://workos-test.com/sign-in'),

    getWorkOS: () => ({
      userManagement: {
        listUsers,
      },
    }),
  }
})

const mockListUsers = vi.mocked(getWorkOS().userManagement.listUsers)

vi.mock('@/workOS/server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/workOS/server')>()

  return {
    ...module,

    getOrganization: vi.fn(),
    createOrganization: vi.fn(),
    getOrganizationsForUser: vi.fn(),
  }
})

const mockGetAvailableChains = vi.mocked(getAvailableChains)
const mockGetChain = vi.mocked(getChain)
const mockGetTokenBalances = vi.mocked(getTokenBalances)
const mockGetTokenByAddress = vi.mocked(getTokenByAddress)
const mockIsValidToken = vi.mocked(isValidToken)

beforeEach(async () => {
  vi.spyOn(window, 'postMessage')

  mockGetAvailableChains.mockResolvedValue([])
  mockGetTokenBalances.mockResolvedValue([])
  mockGetTokenByAddress.mockResolvedValue(createMockToken())
  mockGetChain.mockResolvedValue(createMockChain())
  mockIsValidToken.mockResolvedValue(true)

  mockListUsers.mockResolvedValue(createMockListResult())
})

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})
