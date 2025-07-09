import {
  createProposal,
  findRemoteDefaultRoute,
  getRemoteAccount,
  getRemoteRoute,
} from '@/companion'
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
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import {
  createMockExecutionRoute,
  createMockRoleWaypoint,
  createMockWaypoints,
} from '@zodiac/modules/test-utils'
import { encode, toMetaTransactionRequest } from '@zodiac/schema'
import { expectRouteToBe, randomHex } from '@zodiac/test-utils'
import { User } from 'lucide-react'
import { checkPermissions, PermissionViolation } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockGetRemoteRoute = vi.mocked(getRemoteRoute)
const mockFindRemoteDefaultRoute = vi.mocked(findRemoteDefaultRoute)

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

const mockCreateProposal = vi.mocked(createProposal)

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

      await render('/test-route')

      expect(
        await screen.findByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })

    it('intercepts transactions from the provider', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route')

      MockProvider.getInstance().emit('transaction', createTransaction())

      expect(
        await screen.findByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route', {
        initialState: { executed: [createConfirmedTransaction()] },
      })

      expect(
        await screen.findByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })

    it('stores when the last transaction was executed', async () => {
      await mockRoute({ id: 'test-route' })

      const now = new Date()

      await render('/test-route', {
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

      await render('/test-route', {
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

      await render(`/test-route`, {
        initialState: { pending: [createTransaction()] },
      })

      expect(
        await screen.findByRole('button', { name: 'Translate' }),
      ).toBeDisabled()
    })
  })

  describe('Sign', () => {
    describe('Logged out', () => {
      it('disables the sign button when there are no transactions', async () => {
        await mockRoute({
          id: 'test-route',
          initiator: randomPrefixedAddress(),
        })

        await render('/test-route')

        expect(screen.getByRole('button', { name: 'Sign' })).toBeDisabled()
      })

      it('encodes the route and transaction state into the target of the sign button', async () => {
        const route = await mockRoute({
          id: 'test-route',
          initiator: randomPrefixedAddress(),
        })
        const transaction = createConfirmedTransaction()

        mockCompanionAppUrl('http://localhost')

        await render('/test-route', {
          initialState: { executed: [transaction] },
        })

        expect(screen.getByRole('link', { name: 'Sign' })).toHaveAttribute(
          'href',
          `http://localhost/submit/${encode(route)}/${encode([toMetaTransactionRequest(transaction)])}`,
        )
      })

      it('offers a link to complete the route setup when no initiator is defined', async () => {
        const route = await mockRoute({
          id: 'test-route',
        })

        mockCompanionAppUrl('http://localhost')

        await render('/test-route')

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Complete route setup to sign',
          }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/offline/accounts/${route.id}/${encode(route)}`,
        })
      })
    })

    describe('Logged in', () => {
      it('disables the sign button when there are no transactions', async () => {
        const user = userFactory.createWithoutDb()
        const tenant = tenantFactory.createWithoutDb(user)
        const workspace = workspaceFactory.createWithoutDb(tenant, user)
        const wallet = walletFactory.createWithoutDb(user)
        const account = accountFactory.createWithoutDb(tenant, user, workspace)

        const route = routeFactory.createWithoutDb(account, wallet)

        mockGetRemoteAccount.mockResolvedValue(account)
        mockFindRemoteDefaultRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )
        mockGetRemoteRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )

        await render(`/${account.id}`)

        expect(screen.getByRole('button', { name: 'Sign' })).toBeDisabled()
      })

      it('links to the logged in sign in page', async () => {
        const user = userFactory.createWithoutDb()
        const tenant = tenantFactory.createWithoutDb(user)
        const workspace = workspaceFactory.createWithoutDb(tenant, user)
        const wallet = walletFactory.createWithoutDb(user)
        const account = accountFactory.createWithoutDb(tenant, user, workspace)

        const route = routeFactory.createWithoutDb(account, wallet)

        mockGetRemoteAccount.mockResolvedValue(account)
        mockFindRemoteDefaultRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )
        mockGetRemoteRoute.mockResolvedValue(
          toExecutionRoute({ route, wallet, account }),
        )
        mockCreateProposal.mockResolvedValue({ proposalId: 'test-proposal-id' })

        const transaction = createConfirmedTransaction()

        mockCompanionAppUrl('http://localhost')

        await render(`/${account.id}`, {
          initialState: { executed: [transaction] },
        })

        await userEvent.click(screen.getByRole('button', { name: 'Sign' }))

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/submit/proposal/test-proposal-id/${route.id}`,
        })
      })

      it('offers a link to complete the route setup when no active route was found', async () => {
        const user = userFactory.createWithoutDb()
        const tenant = tenantFactory.createWithoutDb(user)
        const workspace = workspaceFactory.createWithoutDb(tenant, user)
        const account = accountFactory.createWithoutDb(tenant, user, workspace)

        mockGetRemoteAccount.mockResolvedValue(account)

        mockCompanionAppUrl('http://localhost')

        await render(`/${account.id}`)

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Complete route setup to sign',
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

      const { mockedTab } = await render('/test-route')

      const updatedRoute = { ...currentRoute, label: 'Updated' }

      await mockIncomingRouteUpdate(updatedRoute, mockedTab)

      await expect(getRoute(currentRoute.id)).resolves.toEqual(updatedRoute)
    })

    it('saves the route when there are transactions but the route stays the same and the avatar has not changed', async () => {
      const route = await mockRoute({ id: 'test-route' })

      await saveLastUsedAccountId(route.id)

      const { mockedTab } = await render('/test-route', {
        initialState: { executed: [createConfirmedTransaction()] },
      })

      const updatedRoute = { ...route, label: 'Changed label' }

      await mockIncomingRouteUpdate(updatedRoute, mockedTab)

      await expect(getRoute(route.id)).resolves.toEqual(updatedRoute)
    })

    it('provides the saved route back', async () => {
      const currentRoute = await mockRoute({ id: 'test-route' })

      const { mockedTab } = await render('/test-route', {
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

        const { mockedTab } = await render('/test-route', {
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

        const { mockedTab } = await render('/test-route', {
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

        const { mockedTab } = await render('/test-route', {
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

        const { mockedTab } = await render('/test-route')

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

        const { mockedTab } = await render('/test-route', {
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
      const user = userFactory.createWithoutDb()
      const tenant = tenantFactory.createWithoutDb(user)
      const workspace = workspaceFactory.createWithoutDb(tenant, user)
      const account = accountFactory.createWithoutDb(tenant, user, workspace)

      const { mockedTab } = await render('/')

      mockIncomingAccountLaunch(
        { route: createMockExecutionRoute(), account },
        mockedTab,
      )

      await expectRouteToBe(`/${account.id}/no-routes`)
    })
  })
})
