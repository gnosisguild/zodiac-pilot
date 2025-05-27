import { findRemoteActiveRoute, getRemoteAccount } from '@/companion'
import {
  chromeMock,
  createConfirmedTransaction,
  createTransaction,
  mockCompanionAppUrl,
  mockRoute,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import {
  getLastTransactionExecutedAt,
  MockProvider,
  useApplicableTranslation,
} from '@/transactions'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toExecutionRoute } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { encode, toMetaTransactionRequest } from '@zodiac/schema'
import { randomHex } from '@zodiac/test-utils'
import { User } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockFindRemoteActiveRoute = vi.mocked(findRemoteActiveRoute)

vi.mock('@/transactions', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/transactions')>()

  return {
    ...module,

    useApplicableTranslation: vi.fn(),
    useDecodeTransactions: vi.fn(),
  }
})

const mockUseApplicableTranslation = vi.mocked(useApplicableTranslation)

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
      await mockRoute({ id: 'test-route' })

      mockUseApplicableTranslation.mockReturnValue({
        title: 'Translate',
        apply: () => Promise.resolve(),
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
})
