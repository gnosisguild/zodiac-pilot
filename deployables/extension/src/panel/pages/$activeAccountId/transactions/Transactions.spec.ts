import { findRemoteActiveRoute, getRemoteAccount } from '@/companion'
import { getRoute, saveLastUsedAccountId } from '@/execution-routes'
import {
  chromeMock,
  createConfirmedTransaction,
  createMockRoute,
  createTransaction,
  mockCompanionAppUrl,
  mockIncomingAccountLaunch,
  mockIncomingRouteUpdate,
  mockRoute,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { getLastTransactionExecutedAt, MockProvider } from '@/transactions'
import { findApplicableTranslation } from '@/translations'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toExecutionRoute } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { encode, toMetaTransactionRequest } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockWaypoints,
  expectRouteToBe,
  randomHex,
} from '@zodiac/test-utils'
import { User } from 'lucide-react'
import { checkPermissions, PermissionViolation } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockFindRemoteActiveRoute = vi.mocked(findRemoteActiveRoute)

vi.mock('@/transactions', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/transactions')>()

  return {
    ...module,

    useDecodeTransactions: vi.fn(),
  }
})

vi.mock('@/translations', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/translations')>()

  return {
    ...module,

    findApplicableTranslation: vi.fn(),
  }
})

const mockFindApplicableTranslation = vi.mocked(findApplicableTranslation)

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  const { MockProvider } = await vi.importActual<
    typeof import('../../../transactions/MockProvider')
  >('../../../transactions/MockProvider')

  return {
    ...module,

    ForkProvider: MockProvider,
  }
})

vi.mock('ethers', async (importOriginal) => {
  const module = await importOriginal<typeof import('ethers')>()

  const { MockBrowserProvider } = await vi.importActual<
    typeof import('../../../transactions/MockBrowserProvider')
  >('../../../transactions/MockBrowserProvider')

  return {
    ...module,

    BrowserProvider: MockBrowserProvider,
  }
})

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    checkPermissions: vi.fn(),
  }
})

const mockCheckPermissions = vi.mocked(checkPermissions)

describe('Transactions', () => {
  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions')

      expect(
        await screen.findByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })

    it('intercepts transactions from the provider', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions')

      MockProvider.getInstance().emit('transaction', createTransaction())

      expect(
        await screen.findByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions', {
        initialState: { executed: [createConfirmedTransaction()] },
      })

      expect(
        await screen.findByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })

    it('stores when the last transaction was executed', async () => {
      await mockRoute({ id: 'test-route' })

      const now = new Date()

      await render('/test-route/transactions', {
        initialState: {
          executed: [createConfirmedTransaction({ executedAt: now })],
        },
      })

      await expect(getLastTransactionExecutedAt()).resolves.toEqual(
        now.toISOString(),
      )
    })
  })

  describe('Refresh', () => {
    it('disables the refresh button when transactions are pending', async () => {
      await mockRoute({ id: 'test-route' })

      MockProvider.setNextTransactionResult({
        checkpointId: 'test-checkpoint',
        hash: randomHex(),
      })

      await render('/test-route/transactions', {
        initialState: { pending: [createTransaction()] },
      })

      expect(
        await screen.findByRole('button', {
          name: 'Re-simulate on current blockchain head',
        }),
      ).toBeDisabled()
    })
  })

  describe('Translations', () => {
    it('disables the translate button while the simulation is pending', async () => {
      await mockRoute({
        id: 'test-route',
        waypoints: createMockWaypoints({
          waypoints: [createMockRoleWaypoint()],
        }),
      })

      mockCheckPermissions.mockResolvedValue({
        success: false,
        error: PermissionViolation.AllowanceExceeded,
      })

      mockFindApplicableTranslation.mockResolvedValue({
        title: 'Translate',
        autoApply: false,
        icon: User,
        result: [],
      })

      MockProvider.setNextTransactionResult({
        checkpointId: 'test-checkpoint',
        hash: randomHex(),
      })

      await render(`/test-route/transactions`, {
        initialState: { pending: [createTransaction()] },
      })

      expect(
        await screen.findByRole('button', { name: 'Translate' }),
      ).toBeDisabled()
    })
  })

  describe('Submit', () => {
    describe('Logged out', () => {
      it('disables the submit button when there are no transactions', async () => {
        await mockRoute({
          id: 'test-route',
          initiator: randomPrefixedAddress(),
        })

        await render('/test-route/transactions')

        expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
      })

      it('encodes the route and transaction state into the target of the submit button', async () => {
        const route = await mockRoute({
          id: 'test-route',
          initiator: randomPrefixedAddress(),
        })
        const transaction = createConfirmedTransaction()

        mockCompanionAppUrl('http://localhost')

        await render('/test-route/transactions', {
          initialState: { executed: [transaction] },
        })

        expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
          'href',
          `http://localhost/submit/${encode(route)}/${encode([toMetaTransactionRequest(transaction)])}`,
        )
      })

      it('offers a link to complete the route setup when no initiator is defined', async () => {
        const route = await mockRoute({
          id: 'test-route',
        })

        mockCompanionAppUrl('http://localhost')

        await render('/test-route/transactions')

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Complete route setup to submit',
          }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/edit/${route.id}/${encode(route)}`,
        })
      })
    })

    describe('Logged in', () => {
      it('disables the submit button when there are no transactions', async () => {
        const tenant = tenantFactory.createWithoutDb()
        const user = userFactory.createWithoutDb(tenant)
        const wallet = walletFactory.createWithoutDb(user)
        const account = accountFactory.createWithoutDb(tenant, user)

        const route = routeFactory.createWithoutDb(account, wallet)

        mockGetRemoteAccount.mockResolvedValue(account)
        mockFindRemoteActiveRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )

        await render(`/${account.id}/transactions`)

        expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
      })

      it('links to the logged in sign in page', async () => {
        const tenant = tenantFactory.createWithoutDb()
        const user = userFactory.createWithoutDb(tenant)
        const wallet = walletFactory.createWithoutDb(user)
        const account = accountFactory.createWithoutDb(tenant, user)

        const route = routeFactory.createWithoutDb(account, wallet)

        mockGetRemoteAccount.mockResolvedValue(account)
        mockFindRemoteActiveRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )

        const transaction = createConfirmedTransaction()

        mockCompanionAppUrl('http://localhost')

        await render(`/${account.id}/transactions`, {
          initialState: { executed: [transaction] },
        })

        expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
          'href',
          `http://localhost/submit/account/${account.id}/${encode([toMetaTransactionRequest(transaction)])}`,
        )
      })

      it('offers a link to complete the route setup when no active route was found', async () => {
        const tenant = tenantFactory.createWithoutDb()
        const user = userFactory.createWithoutDb(tenant)
        const account = accountFactory.createWithoutDb(tenant, user)

        mockGetRemoteAccount.mockResolvedValue(account)

        mockCompanionAppUrl('http://localhost')

        await render(`/${account.id}/transactions`)

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Complete route setup to submit',
          }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/account/${account.id}`,
        })
      })
    })
  })

  describe('Save route', () => {
    it('stores route data it receives from the companion app', async () => {
      const currentRoute = await mockRoute({ label: 'Test', id: 'test-route' })

      const { mockedTab } = await render('/test-route/transactions')

      const updatedRoute = { ...currentRoute, label: 'Updated' }

      await mockIncomingRouteUpdate(updatedRoute, mockedTab)

      await expect(getRoute(currentRoute.id)).resolves.toEqual(updatedRoute)
    })

    it('saves the route when there are transactions but the route stays the same and the avatar has not changed', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await saveLastUsedAccountId(route.id)

      const { mockedTab } = await render('/test-route/transactions', {
        initialState: { executed: [createConfirmedTransaction()] },
      })

      const updatedRoute = { ...route, label: 'Changed label' }

      await mockIncomingRouteUpdate(updatedRoute, mockedTab)

      await expect(getRoute(route.id)).resolves.toEqual(updatedRoute)
    })

    it('provides the saved route back', async () => {
      const currentRoute = await mockRoute({ id: 'test-route' })

      const { mockedTab } = await render('/test-route/transactions', {
        activeTab: { url: getCompanionAppUrl() },
      })

      await mockIncomingRouteUpdate(currentRoute, mockedTab)

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route: currentRoute,
        } satisfies CompanionResponseMessage)
      })
    })

    describe('Clearing transactions', () => {
      it('warns about clearing transactions when the avatars differ', async () => {
        const currentAvatar = randomPrefixedAddress()

        const currentRoute = await mockRoute({
          id: 'test-route',
          avatar: currentAvatar,
        })
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/test-route/transactions', {
          initialState: { executed: [createConfirmedTransaction()] },
        })

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            avatar: randomPrefixedAddress(),
          },
          mockedTab,
        )

        expect(
          await screen.findByRole('dialog', { name: 'Clear transactions' }),
        ).toBeInTheDocument()
      })

      it('does not warn about clearing transactions when the avatars stay the same', async () => {
        const currentRoute = await mockRoute({
          id: 'test-route',
          avatar: randomPrefixedAddress(),
        })
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/test-route/transactions', {
          initialState: { executed: [createConfirmedTransaction()] },
        })

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            label: 'New label',
          },
          mockedTab,
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('does not warn when the route differs from the currently active one', async () => {
        const currentRoute = await mockRoute({
          id: 'test-route',
          avatar: randomPrefixedAddress(),
        })
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/test-route/transactions', {
          initialState: { executed: [createConfirmedTransaction()] },
        })

        await mockIncomingRouteUpdate(
          createMockRoute({
            id: 'another-route',
            avatar: randomPrefixedAddress(),
          }),
          mockedTab,
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('should not warn about clearing transactions when there are none', async () => {
        const currentRoute = await mockRoute({
          id: 'test-route',
          avatar: randomPrefixedAddress(),
        })
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/test-route/transactions')

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            avatar: randomPrefixedAddress(),
          },
          mockedTab,
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('is saves the incoming route when the user accepts to clear transactions', async () => {
        const currentRoute = await mockRoute()
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: { executed: [createConfirmedTransaction()] },
        })

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

        await mockIncomingRouteUpdate(updatedRoute, mockedTab)

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear transactions' }),
        )

        await expect(getRoute(currentRoute.id)).resolves.toEqual(updatedRoute)
      })

      it('clears transactions', async () => {
        const currentRoute = await mockRoute({ id: 'test-route' })
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/test-route/transactions', {
          initialState: { executed: [createConfirmedTransaction()] },
        })

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

        await mockIncomingRouteUpdate(updatedRoute, mockedTab)

        const { getByRole } = within(
          await screen.findByRole('dialog', { name: 'Clear transactions' }),
        )

        await userEvent.click(
          getByRole('button', { name: 'Clear transactions' }),
        )

        expect(
          await screen.findByRole('alert', { name: 'No transactions' }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Save and launch', () => {
    it('is possible to save and launch a remote account', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const account = accountFactory.createWithoutDb(tenant, user)

      const { mockedTab } = await render('/')

      mockIncomingAccountLaunch(
        { route: createMockExecutionRoute(), account },
        mockedTab,
      )

      await expectRouteToBe(`/${account.id}/transactions`)
    })
  })
})
