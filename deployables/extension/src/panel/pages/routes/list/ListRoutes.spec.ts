import {
  getLastUsedRouteId,
  getRoutes,
  saveLastUsedRouteId,
} from '@/execution-routes'
import {
  createMockRoute,
  createTransaction,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ETH_ZERO_ADDRESS } from '@zodiac/chains'
import { expectRouteToBe, randomPrefixedAddress } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { action, ListRoutes, loader } from './ListRoutes'

describe('List routes', () => {
  describe('Edit', () => {
    it('is possible to modify an existing route', async () => {
      const route = await mockRoute({
        id: 'testRoute',
        label: 'Test route',
        initiator: ETH_ZERO_ADDRESS,
      })

      await render(
        '/routes/list',
        [{ Component: ListRoutes, path: '/routes/list', loader, action }],
        { companionAppUrl: 'http://localhost' },
      )

      expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
        'href',
        `http://localhost/edit-route/${btoa(JSON.stringify(route))}`,
      )
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
        avatar: randomPrefixedAddress(),
        id: 'firstRoute',
        label: 'First route',
      })

      await saveLastUsedRouteId('firstRoute')

      mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
        avatar: randomPrefixedAddress(),
      })

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
        avatar: randomPrefixedAddress(),
        id: 'firstRoute',
        label: 'First route',
      })

      await mockRoutes(selectedRoute, {
        avatar: randomPrefixedAddress(),
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
        { companionAppUrl: 'http://localhost' },
      )

      expect(screen.getByRole('link', { name: 'Add route' })).toHaveAttribute(
        'href',
        'http://localhost/new-route',
      )
    })
  })

  describe('Remove', () => {
    it('is possible to remove a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes', [
        {
          path: '/routes',
          Component: ListRoutes,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expect(getRoutes()).resolves.toEqual([])
    })

    it('does not remove the route if the user cancels', async () => {
      const route = await mockRoute({ id: 'route-id' })

      await render('/routes', [
        {
          path: '/routes',
          Component: ListRoutes,
          loader,
          action,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getAllByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getAllByRole('button', { name: 'Cancel' })[0])

      await expect(getRoutes()).resolves.toEqual([route])
    })

    it('navigates back to the root when the last route is removed', async () => {
      await mockRoutes({ id: 'route-id' })

      await render(
        '/routes',
        [
          {
            path: '/routes',
            Component: ListRoutes,
            loader,
            action,
          },
        ],
        { inspectRoutes: ['/'] },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expectRouteToBe('/')
    })

    it('sets another route as active, when the the deleted route is currently active', async () => {
      await mockRoutes(
        { id: 'first-route', label: 'First route' },
        { id: 'second-route' },
      )

      await render(
        '/routes',
        [
          {
            path: '/routes',
            Component: ListRoutes,
            loader,
            action,
          },
        ],
        { inspectRoutes: ['/routes'] },
      )

      const { getByRole: getByRoleInRoute } = within(
        screen.getByRole('region', { name: 'First route' }),
      )

      await userEvent.click(
        getByRoleInRoute('button', { name: 'Remove route' }),
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expect(getLastUsedRouteId()).resolves.toEqual('second-route')
    })
  })
})
