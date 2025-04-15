import {
  getRemoteAccount,
  getRemoteAccounts,
  getRemoteActiveRoute,
} from '@/companion'
import {
  chromeMock,
  createTransaction,
  mockCompanionAppUrl,
  mockRoute,
  mockRoutes,
  randomPrefixedAddress,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toExecutionRoute } from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { encode } from '@zodiac/schema'
import { createMockWaypoints, expectRouteToBe } from '@zodiac/test-utils'
import { mockTab } from '@zodiac/test-utils/chrome'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteActiveRoute = vi.mocked(getRemoteActiveRoute)
const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockGetRemoteAccounts = vi.mocked(getRemoteAccounts)

describe('Transactions', () => {
  describe('Route switch', () => {
    it('is possible to switch the active route', async () => {
      await mockRoutes(
        { id: 'first-route', label: 'First route' },
        { id: 'second-route', label: 'Second route' },
      )

      await render('/first-route/transactions')

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Safe Accounts' }),
      )
      await userEvent.click(
        screen.getByRole('option', { name: 'Second route' }),
      )

      await expectRouteToBe(`/second-route/transactions`)
    })

    it('lists routes from the zodiac os', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const account = accountFactory.createWithoutDb(tenant, user, {
        label: 'Remote account',
      })

      mockGetRemoteAccounts.mockResolvedValue([account])

      await mockRoute({ id: 'first-route' })

      await render('/first-route/transactions')

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Safe Accounts' }),
      )

      expect(
        await screen.findByRole('option', { name: 'Remote account' }),
      ).toBeInTheDocument()
    })

    it('is possible to activate an account from zodiac os', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const wallet = walletFactory.createWithoutDb(user)
      const account = accountFactory.createWithoutDb(tenant, user, {
        id: 'second-account',
        label: 'Remote account',
      })

      mockGetRemoteActiveRoute.mockResolvedValue(
        toExecutionRoute({ account, wallet, waypoints: createMockWaypoints() }),
      )
      mockGetRemoteAccount.mockResolvedValue(account)
      mockGetRemoteAccounts.mockResolvedValue([account])

      await mockRoute({ id: 'first-route' })

      await render('/first-route/transactions')

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Safe Accounts' }),
      )

      await userEvent.click(
        await screen.findByRole('option', { name: 'Remote account' }),
      )

      await expectRouteToBe('/second-account/transactions')
    })

    it('renders when an account from zodiac os is active', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const account = accountFactory.createWithoutDb(tenant, user, {
        id: 'test-account',
        label: 'Remote account',
      })

      mockGetRemoteAccount.mockResolvedValue(account)
      mockGetRemoteAccounts.mockResolvedValue([account])

      await render('/test-account/transactions')

      expect(await screen.findByText('Remote account')).toBeInTheDocument()
    })
  })

  describe('Recording state', () => {
    it('hides the info when Pilot is ready', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions')

      expect(
        screen.getByRole('heading', { name: 'Recording transactions' }),
      ).not.toHaveAccessibleDescription()
    })
  })

  describe('List', () => {
    it('lists transactions', async () => {
      await mockRoute({ id: 'test-route' })

      await render('/test-route/transactions', {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })

  describe('Submit', () => {
    it('disables the submit button when there are no transactions', async () => {
      await mockRoute({ id: 'test-route', initiator: randomPrefixedAddress() })

      await render('/test-route/transactions')

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    })

    it('encodes the route and transaction state into the target of the submit button', async () => {
      const route = await mockRoute({
        id: 'test-route',
        initiator: randomPrefixedAddress(),
      })
      const transaction = createTransaction()

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions', {
        initialState: [transaction],
      })

      expect(screen.getByRole('link', { name: 'Submit' })).toHaveAttribute(
        'href',
        `http://localhost/submit/${encode(route)}/${encode([transaction.transaction])}`,
      )
    })

    it('offers a link to complete the route setup when no initiator is defined', async () => {
      const route = await mockRoute({
        id: 'test-route',
      })

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions')

      await userEvent.click(
        screen.getByRole('button', { name: 'Complete route setup to submit' }),
      )

      expect(chromeMock.tabs.create).toHaveBeenCalledWith({
        active: true,
        url: `http://localhost/edit/${route.id}/${encode(route)}`,
      })
    })
  })

  describe('Edit', () => {
    describe('Current route', () => {
      it('is possible to edit the current route', async () => {
        const route = await mockRoute({ id: 'test-route' })

        mockCompanionAppUrl('http://localhost')

        await render('/test-route/transactions', {
          initialState: [createTransaction()],
        })

        await userEvent.click(
          screen.getByRole('button', { name: 'Edit account' }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: `http://localhost/edit/${route.id}/${encode(route)}`,
        })
      })

      it('activates an existing tab when it already exists', async () => {
        const route = await mockRoute({ id: 'test-route' })
        mockCompanionAppUrl('http://localhost')

        const tab = mockTab({
          url: `http://localhost/edit/${route.id}/some-old-route-data`,
        })

        await render('/test-route/transactions', {
          initialState: [createTransaction()],
        })

        await userEvent.click(
          screen.getByRole('button', { name: 'Edit account' }),
        )

        expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
          active: true,
          url: `http://localhost/edit/${route.id}/${encode(route)}`,
        })
      })
    })

    describe('List all routes', () => {
      it('is possible to see all routes', async () => {
        await mockRoute({ id: 'test-route' })
        mockCompanionAppUrl('http://localhost')

        await render('/test-route/transactions')

        await userEvent.click(
          screen.getByRole('button', { name: 'List accounts' }),
        )

        expect(chromeMock.tabs.create).toHaveBeenCalledWith({
          active: true,
          url: 'http://localhost/edit',
        })
      })

      it('activates an existing tab when it already exists', async () => {
        await mockRoute({ id: 'test-route' })

        mockCompanionAppUrl('http://localhost')

        const tab = mockTab({
          url: `http://localhost/edit`,
        })

        await render('/test-route/transactions')

        await userEvent.click(
          screen.getByRole('button', { name: 'List accounts' }),
        )

        expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
          active: true,
        })
      })
    })
  })

  describe('Token actions', () => {
    it('shows a link to view the current balances', async () => {
      await mockRoute({ id: 'test-route' })

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions', {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('link', { name: 'View balances' }),
      ).toHaveAttribute('href', 'http://localhost/tokens/balances')
    })

    it('offers to send tokens', async () => {
      await mockRoute({ id: 'test-route' })

      mockCompanionAppUrl('http://localhost')

      await render('/test-route/transactions', {
        initialState: [createTransaction()],
      })

      expect(screen.getByRole('link', { name: 'Send tokens' })).toHaveAttribute(
        'href',
        'http://localhost/tokens/send',
      )
    })
  })
})
