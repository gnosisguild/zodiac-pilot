import {
  findRemoteDefaultRoute,
  getRemoteAccount,
  getRemoteAccounts,
  getRemoteRoutes,
  saveRemoteActiveAccount,
} from '@/companion'
import {
  chromeMock,
  mockCompanionAppUrl,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
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
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import { expectRouteToBe } from '@zodiac/test-utils'
import { mockTab } from '@zodiac/test-utils/chrome'
import { describe, expect, it, vi } from 'vitest'

mockCompanionAppUrl('http://companion-app.com')

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)
const mockGetRemoteAccounts = vi.mocked(getRemoteAccounts)
const mockFindRemoteDefaultRoute = vi.mocked(findRemoteDefaultRoute)
const mockGetRemoteRoutes = vi.mocked(getRemoteRoutes)

describe('Active Account', () => {
  describe('Account switch', () => {
    it('is possible to switch the active route', async () => {
      await mockRoutes(
        { id: 'first-route', label: 'First route' },
        { id: 'second-route', label: 'Second route' },
      )

      await render('/first-route')

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Safe Accounts' }),
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

      await render('/first-route')

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
        label: 'Remote account',
      })
      const route = routeFactory.createWithoutDb(account, wallet)

      mockFindRemoteDefaultRoute.mockResolvedValue(
        toExecutionRoute({ account, wallet, route }),
      )
      mockGetRemoteAccount.mockResolvedValue(account)
      mockGetRemoteAccounts.mockResolvedValue([account])

      await mockRoute({ id: 'first-route' })

      await render('/first-route')

      await userEvent.click(
        screen.getByRole('combobox', { name: 'Safe Accounts' }),
      )

      await userEvent.click(
        await screen.findByRole('option', { name: 'Remote account' }),
      )

      await expectRouteToBe(`/${account.id}/transactions`)
    })

    it('renders when an account from zodiac os is active', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const account = accountFactory.createWithoutDb(tenant, user, {
        label: 'Remote account',
      })

      mockGetRemoteAccount.mockResolvedValue(account)
      mockGetRemoteAccounts.mockResolvedValue([account])

      await render(`/${account.id}`)

      expect(await screen.findByText('Remote account')).toBeInTheDocument()
    })

    it('communicates the new active route as an event', async () => {
      await mockRoute({ id: 'first-route', label: 'First route' })

      const { mockedTab } = await render('/first-route', {
        activeTab: { url: getCompanionAppUrl() },
      })

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: 'first-route',
      } satisfies CompanionResponseMessage)
    })

    it('tries to store the new active account on the remote', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)

      const account = accountFactory.createWithoutDb(tenant, user)

      mockGetRemoteAccount.mockResolvedValue(account)

      await render(`/${account.id}`)

      expect(saveRemoteActiveAccount).toHaveBeenCalledWith(
        account,
        expect.anything(),
      )
    })
  })

  describe('Route switch', () => {
    it('shows a select for routes when there is more than one route for an account', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)

      const wallet = walletFactory.createWithoutDb(user)
      const account = accountFactory.createWithoutDb(tenant, user)

      const routeA = routeFactory.createWithoutDb(account, wallet)
      const routeB = routeFactory.createWithoutDb(account, wallet)

      mockGetRemoteRoutes.mockResolvedValue([routeA, routeB])

      await render(`/${account.id}`)

      expect(
        await screen.findByRole('combobox', { name: 'Selected route' }),
      ).toBeInTheDocument()
    })

    it.todo('pre-selects the default route')
    it.todo('pre-selects the first route if there is no default route')
    it.todo('is possible to change the route')
    it.todo('uses the selected route to sign the transaction bundle')
  })

  describe('Edit', () => {
    describe('Current route', () => {
      describe('Local accounts', () => {
        it('is possible to edit the current route', async () => {
          const route = await mockRoute({ id: 'test-route' })

          mockCompanionAppUrl('http://localhost')

          await render('/test-route')

          await userEvent.click(
            screen.getByRole('button', { name: 'Account actions' }),
          )
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

          await render('/test-route')

          await userEvent.click(
            screen.getByRole('button', { name: 'Account actions' }),
          )
          await userEvent.click(
            screen.getByRole('button', { name: 'Edit account' }),
          )

          expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
            active: true,
            url: `http://localhost/edit/${route.id}/${encode(route)}`,
          })
        })
      })

      describe('Remote accounts', () => {
        it('is possible to edit the current account', async () => {
          const tenant = tenantFactory.createWithoutDb()
          const user = userFactory.createWithoutDb(tenant)
          const account = accountFactory.createWithoutDb(tenant, user)

          mockGetRemoteAccount.mockResolvedValue(account)
          mockGetRemoteAccounts.mockResolvedValue([account])

          mockCompanionAppUrl('http://localhost')

          await render(`/${account.id}`)

          await userEvent.click(
            screen.getByRole('button', { name: 'Account actions' }),
          )
          await userEvent.click(
            screen.getByRole('button', { name: 'Edit account' }),
          )

          expect(chromeMock.tabs.create).toHaveBeenCalledWith({
            active: true,
            url: `http://localhost/account/${account.id}`,
          })
        })

        it.todo('respects the currently selected route')

        it('activates an existing tab when it already exists', async () => {
          const tenant = tenantFactory.createWithoutDb()
          const user = userFactory.createWithoutDb(tenant)
          const account = accountFactory.createWithoutDb(tenant, user)

          mockGetRemoteAccount.mockResolvedValue(account)
          mockGetRemoteAccounts.mockResolvedValue([account])

          mockCompanionAppUrl('http://localhost')

          const tab = mockTab({
            url: `http://localhost/account/${account.id}`,
          })

          await render(`/${account.id}`)

          await userEvent.click(
            screen.getByRole('button', { name: 'Account actions' }),
          )
          await userEvent.click(
            screen.getByRole('button', { name: 'Edit account' }),
          )

          expect(chromeMock.tabs.update).toHaveBeenCalledWith(tab.id, {
            active: true,
            url: `http://localhost/account/${account.id}`,
          })
        })
      })
    })

    describe('List all routes', () => {
      it('is possible to see all routes', async () => {
        await mockRoute({ id: 'test-route' })
        mockCompanionAppUrl('http://localhost')

        await render('/test-route')

        await userEvent.click(
          screen.getByRole('button', { name: 'Account actions' }),
        )
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

        await render('/test-route')

        await userEvent.click(
          screen.getByRole('button', { name: 'Account actions' }),
        )
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

      await render('/test-route')

      expect(
        screen.getByRole('link', { name: 'View balances' }),
      ).toHaveAttribute('href', 'http://localhost/tokens/balances')
    })

    it('offers to send tokens', async () => {
      await mockRoute({ id: 'test-route' })

      mockCompanionAppUrl('http://localhost')

      await render('/test-route')

      expect(screen.getByRole('link', { name: 'Send tokens' })).toHaveAttribute(
        'href',
        'http://localhost/tokens/send',
      )
    })
  })

  describe('Removed remote account', () => {
    it('handles deleted remote accounts gracefully', async () => {
      mockGetRemoteAccount.mockRejectedValue('Account not found')

      await render('/deleted-account-id')

      await expectRouteToBe('/')
    })
  })
})
