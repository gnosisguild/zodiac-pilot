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
import { useApplicableTranslation } from '@/transaction-translation'
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
import { encode } from '@zodiac/schema'
import { User } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockFindRemoteActiveRoute = vi.mocked(findRemoteActiveRoute)

vi.mock('@/transaction-translation', async (importOriginal) => {
  const module =
    await importOriginal<typeof import('@/transaction-translation')>()

  return {
    ...module,

    useApplicableTranslation: vi.fn(),
  }
})

const mockUseApplicableTranslation = vi.mocked(useApplicableTranslation)

vi.mock('@/providers-ui', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers-ui')>()

  return {
    ...module,

    useSendTransactions: vi.fn(),
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
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions', {
        initialState: { done: [createConfirmedTransaction()] },
      })

      expect(
        await screen.findByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Refresh', () => {
    it('disables the refresh button when transactions are pending', async () => {
      await mockRoute({ id: 'test-route' })

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
          initialState: { done: [transaction] },
        })

        expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
          'href',
          `http://localhost/submit/${encode(route)}/${encode([transaction])}`,
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
          initialState: { done: [transaction] },
        })

        expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
          'href',
          `http://localhost/submit/account/${account.id}/${encode([transaction])}`,
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
