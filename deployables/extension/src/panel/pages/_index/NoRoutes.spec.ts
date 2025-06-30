import { findRemoteActiveAccount, getRemoteAccounts } from '@/companion'
import { saveLastUsedAccountId } from '@/execution-routes'
import {
  mockCompanionAppUrl,
  mockIncomingAccountLaunch,
  mockProviderRequest,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { createMockExecutionRoute, expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteAccounts = vi.mocked(getRemoteAccounts)
const mockFindRemoteActiveAccount = vi.mocked(findRemoteActiveAccount)

describe('No routes', () => {
  describe('Default redirects', () => {
    describe('Logged out', () => {
      it('redirects to the last used route if one is present', async () => {
        await mockRoute({ id: 'test-route' })
        await saveLastUsedAccountId('test-route')

        await render('/')

        await expectRouteToBe('/test-route/test-route')
      })

      it('redirects to the first route if no route was last used', async () => {
        await mockRoutes({ id: 'first-route' }, { id: 'second-route' })

        await render('/')

        await expectRouteToBe('/first-route/first-route')
      })
    })

    describe('Logged in', () => {
      it('redirects to the last used route if one is present', async () => {
        const tenant = tenantFactory.createWithoutDb()
        const user = userFactory.createWithoutDb(tenant)
        const account = accountFactory.createWithoutDb(tenant, user)

        mockFindRemoteActiveAccount.mockResolvedValue(account)

        await render('/')

        await expectRouteToBe(`/${account.id}/no-routes`)
      })

      it('redirects to the first route if no route was last used', async () => {
        const tenant = tenantFactory.createWithoutDb()
        const user = userFactory.createWithoutDb(tenant)
        const account = accountFactory.createWithoutDb(tenant, user)

        mockGetRemoteAccounts.mockResolvedValue([account])

        await render('/')

        await expectRouteToBe(`/${account.id}/no-routes`)
      })
    })
  })

  describe('No routes available', () => {
    it('allows to create a new route', async () => {
      mockCompanionAppUrl('http://localhost')

      await render('/')

      expect(screen.getByRole('link', { name: 'Add account' })).toHaveAttribute(
        'href',
        'http://localhost/create',
      )
    })

    it('shows an error when the user tries to connect a dApp', async () => {
      await render('/')

      await mockProviderRequest()

      expect(
        screen.getByRole('alert', { name: 'No active account' }),
      ).toHaveAccessibleDescription(
        'To use Zodiac Pilot with a dApp you need to create an account.',
      )
    })

    describe('Incoming route', () => {
      describe('Logged in', () => {
        it('redirects the a new account when one is saved', async () => {
          const tenant = tenantFactory.createWithoutDb()
          const user = userFactory.createWithoutDb(tenant)
          const account = accountFactory.createWithoutDb(tenant, user)

          const { mockedTab } = await render('/')

          await mockIncomingAccountLaunch(
            {
              account,
              route: createMockExecutionRoute(),
            },
            mockedTab,
          )

          await expectRouteToBe(`/${account.id}/no-routes`)
        })
      })

      describe('Logged out', () => {
        it('redirects the a new account when one is saved', async () => {
          const { mockedTab } = await render('/')

          const route = createMockExecutionRoute()

          await mockIncomingAccountLaunch({ route }, mockedTab)

          await expectRouteToBe(`/${route.id}/${route.id}`)
        })
      })
    })
  })
})
