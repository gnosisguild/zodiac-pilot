import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import { getRoutes, saveLastUsedRouteId } from '@/execution-routes'
import {
  connectMockWallet,
  createMockRoute,
  createTransaction,
  expectRouteToBe,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { action, ListRoutes, loader } from './ListRoutes'

describe('List routes', () => {
  describe('Edit', () => {
    it('is possible to modify an existing route', async () => {
      mockRoutes({
        id: 'testRoute',
        label: 'Test route',
        initiator: ETH_ZERO_ADDRESS,
      })

      const { mockedPort } = await render(
        '/routes/list',
        [{ Component: ListRoutes, path: '/routes/list', loader, action }],
        {
          inspectRoutes: ['/routes/edit/:route-id'],
        },
      )

      await connectMockWallet(mockedPort, {
        accounts: [ZERO_ADDRESS],
        chainId: '0x1',
      })

      await userEvent.click(screen.getByRole('link', { name: 'Edit' }))

      await expectRouteToBe('/routes/edit/testRoute')
    })
  })

  describe('Launch', () => {
    it('is possible to launch a route', async () => {
      await mockRoute({ id: 'test-route' })

      await render(
        '/routes',
        [{ path: '/routes', Component: ListRoutes, loader, action }],
        { inspectRoutes: ['/:activeRouteId'] },
      )

      await userEvent.click(screen.getByRole('button', { name: 'Launch' }))

      await expectRouteToBe('/test-route')
    })

    it('is possible to launch a new route and clear transactions', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
      })

      await saveLastUsedRouteId('firstRoute')

      mockRoutes(selectedRoute, { id: 'secondRoute', label: 'Second route' })

      await render(
        '/routes',
        [{ path: '/routes', Component: ListRoutes, loader, action }],
        {
          initialState: [createTransaction()],
          inspectRoutes: [
            '/:activeRouteId/clear-transactions/:newActiveRouteId',
          ],
        },
      )

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'Clear transactions' }),
      )

      await expectRouteToBe('/firstRoute/clear-transactions/secondRoute')
    })
  })

  describe('Clearing transactions', () => {
    it('warns about clearing transactions when the avatars differ', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
      })

      await mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
      })
      await saveLastUsedRouteId(selectedRoute.id)

      await render(
        '/routes',
        [{ path: '/routes', Component: ListRoutes, loader, action }],
        {
          initialState: [createTransaction()],
        },
      )

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))

      expect(
        screen.getByRole('dialog', { name: 'Clear transactions' }),
      ).toBeInTheDocument()
    })

    it('does not warn about clearing transactions when the avatars stay the same', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
        avatar: ETH_ZERO_ADDRESS,
      })

      await mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
        avatar: ETH_ZERO_ADDRESS,
      })
      await saveLastUsedRouteId(selectedRoute.id)

      await render(
        '/routes',
        [{ path: '/routes', Component: ListRoutes, loader, action }],
        {
          initialState: [createTransaction()],
        },
      )

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('should not warn about clearing transactions when there are none', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
      })

      await mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
      })
      await saveLastUsedRouteId(selectedRoute.id)

      await render('/routes', [
        { path: '/routes', Component: ListRoutes, loader, action },
      ])

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('New route', () => {
    it('is possible to create a new route', async () => {
      await render(
        '/routes',
        [{ path: '/routes', Component: ListRoutes, loader, action }],
        { inspectRoutes: ['/routes/edit/:routeId'] },
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add route' }))

      const [newRoute] = await getRoutes()

      await expectRouteToBe(`/routes/edit/${newRoute.id}`)
    })
  })
})
