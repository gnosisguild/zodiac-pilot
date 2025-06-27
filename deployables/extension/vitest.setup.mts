import {
  findRemoteActiveAccount,
  findRemoteDefaultRoute,
  getFeatures,
  getRemoteAccount,
  getRemoteAccounts,
  getRemoteRoutes,
  getUser,
} from '@/companion'
import { removeStorageEntry } from '@/storage'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { sleepTillIdle } from '@zodiac/test-utils'
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
    findRemoteDefaultRoute: vi.fn(),
    findRemoteActiveAccount: vi.fn(),
    getRemoteAccount: vi.fn(),
    getRemoteAccounts: vi.fn(),
    getRemoteRoutes: vi.fn(),
    getFeatures: vi.fn(),

    saveRemoteActiveAccount: vi.fn(),

    createProposal: vi.fn(),
  }
})

const mockFindRemoteDefaultRoute = vi.mocked(findRemoteDefaultRoute)
const mockGetUser = vi.mocked(getUser)
const mockGetRemoteRoutes = vi.mocked(getRemoteRoutes)
const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockFindRemoteActiveAccount = vi.mocked(findRemoteActiveAccount)
const mockGetRemoteAccounts = vi.mocked(getRemoteAccounts)
const mockGetFeatures = vi.mocked(getFeatures)

beforeEach(() => {
  const tenant = tenantFactory.createWithoutDb()
  const user = userFactory.createWithoutDb(tenant)
  const account = accountFactory.createWithoutDb(tenant, user)

  mockGetRemoteRoutes.mockResolvedValue([])
  mockFindRemoteDefaultRoute.mockResolvedValue(null)
  mockFindRemoteActiveAccount.mockResolvedValue(null)
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
  await removeStorageEntry({ key: 'transactionState' })

  cleanup()
})
