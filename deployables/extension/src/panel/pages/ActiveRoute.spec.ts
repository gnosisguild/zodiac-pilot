import {
  findRemoteDefaultRoute,
  getRemoteRoute,
  getRemoteRoutes,
} from '@/companion'
import { render } from '@/test-utils'
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
import { expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'

const mockGetRemoteRoute = vi.mocked(getRemoteRoute)
const mockFindRemoteDefaultRoute = vi.mocked(findRemoteDefaultRoute)
const mockGetRemoteRoutes = vi.mocked(getRemoteRoutes)

describe('Active route', () => {
  it('shows a select for routes when there is more than one route for an account', async () => {
    const user = userFactory.createWithoutDb()
    const tenant = tenantFactory.createWithoutDb(user)

    const wallet = walletFactory.createWithoutDb(user)
    const account = accountFactory.createWithoutDb(tenant, user)

    const routeA = routeFactory.createWithoutDb(account, wallet)
    const routeB = routeFactory.createWithoutDb(account, wallet)

    mockGetRemoteRoutes.mockResolvedValue([
      toExecutionRoute({ wallet, account, route: routeA }),
      toExecutionRoute({ wallet, account, route: routeB }),
    ])

    await render(`/${account.id}`)

    expect(
      await screen.findByRole('combobox', { name: 'Selected route' }),
    ).toBeInTheDocument()
  })

  it('pre-selects the default route', async () => {
    const user = userFactory.createWithoutDb()
    const tenant = tenantFactory.createWithoutDb(user)

    const wallet = walletFactory.createWithoutDb(user)
    const account = accountFactory.createWithoutDb(tenant, user)

    const routeA = routeFactory.createWithoutDb(account, wallet)
    const routeB = routeFactory.createWithoutDb(account, wallet, {
      label: 'Route B',
    })

    mockGetRemoteRoutes.mockResolvedValue([
      toExecutionRoute({ wallet, account, route: routeA }),
      toExecutionRoute({ wallet, account, route: routeB }),
    ])
    mockFindRemoteDefaultRoute.mockResolvedValue(
      toExecutionRoute({ wallet, account, route: routeB }),
    )
    mockGetRemoteRoute.mockResolvedValue(
      toExecutionRoute({ wallet, account, route: routeB }),
    )

    await render(`/${account.id}`)

    expect(await screen.findByText('Route B')).toBeInTheDocument()
  })

  it('pre-selects the first route if there is no default route', async () => {
    const user = userFactory.createWithoutDb()
    const tenant = tenantFactory.createWithoutDb(user)

    const wallet = walletFactory.createWithoutDb(user)
    const account = accountFactory.createWithoutDb(tenant, user)

    const routeA = routeFactory.createWithoutDb(account, wallet, {
      label: 'Route A',
    })
    const routeB = routeFactory.createWithoutDb(account, wallet, {
      label: 'Route B',
    })

    mockGetRemoteRoutes.mockResolvedValue([
      toExecutionRoute({ wallet, account, route: routeA }),
      toExecutionRoute({ wallet, account, route: routeB }),
    ])
    mockFindRemoteDefaultRoute.mockResolvedValue(null)
    mockGetRemoteRoute.mockResolvedValue(
      toExecutionRoute({ wallet, account, route: routeA }),
    )

    await render(`/${account.id}`)

    expect(await screen.findByText('Route A')).toBeInTheDocument()
  })

  it('is possible to change the route', async () => {
    const user = userFactory.createWithoutDb()
    const tenant = tenantFactory.createWithoutDb(user)

    const wallet = walletFactory.createWithoutDb(user)
    const account = accountFactory.createWithoutDb(tenant, user)

    const routeA = routeFactory.createWithoutDb(account, wallet, {
      label: 'Route A',
    })
    const routeB = routeFactory.createWithoutDb(account, wallet, {
      label: 'Route B',
    })

    mockGetRemoteRoutes.mockResolvedValue([
      toExecutionRoute({ wallet, account, route: routeA }),
      toExecutionRoute({ wallet, account, route: routeB }),
    ])
    mockFindRemoteDefaultRoute.mockResolvedValue(null)
    mockGetRemoteRoute.mockResolvedValue(
      toExecutionRoute({ wallet, account, route: routeA }),
    )

    await render(`/${account.id}`)

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Selected route' }),
    )
    await userEvent.click(
      await screen.findByRole('option', { name: 'Route B' }),
    )

    await expectRouteToBe(`/${account.id}/${routeB.id}`)
  })
})
