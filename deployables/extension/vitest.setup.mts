import {
  getFeatures,
  getRemoteAccount,
  getRemoteAccounts,
  getRemoteActiveRoute,
  getUser,
} from '@/companion'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toExecutionRoute } from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { createMockWaypoints, sleepTillIdle } from '@zodiac/test-utils'
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks'
import { afterAll, afterEach, beforeEach, vi } from 'vitest'

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getCompanionAppUrl: vi.fn(),
  }
})

vi.mock('@/companion', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/companion')>()

  return {
    ...module,

    getUser: vi.fn(),
    getRemoteActiveRoute: vi.fn(),
    getRemoteAccount: vi.fn(),
    getRemoteAccounts: vi.fn(),
    getFeatures: vi.fn(),
  }
})

const mockGetRemoteActiveRoute = vi.mocked(getRemoteActiveRoute)
const mockGetUser = vi.mocked(getUser)
const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockGetRemoteAccounts = vi.mocked(getRemoteAccounts)
const mockGetFeatures = vi.mocked(getFeatures)

beforeEach(() => {
  const tenant = tenantFactory.createWithoutDb()
  const user = userFactory.createWithoutDb(tenant)
  const account = accountFactory.createWithoutDb(tenant, user)
  const wallet = walletFactory.createWithoutDb(user)

  mockGetRemoteActiveRoute.mockResolvedValue(
    toExecutionRoute({ wallet, account, waypoints: createMockWaypoints() }),
  )
  mockGetUser.mockResolvedValue(null)
  mockGetRemoteAccount.mockResolvedValue(account)
  mockGetRemoteAccounts.mockResolvedValue([])
  mockGetFeatures.mockResolvedValue([])
})

configMocks({ afterEach, afterAll })

mockAnimationsApi()

window.document.body.innerHTML = '<div id="root"></div>'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})
