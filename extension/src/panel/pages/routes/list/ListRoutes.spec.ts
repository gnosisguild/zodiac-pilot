import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import {
  connectMockWallet,
  createMockRoute,
  createTransaction,
  expectRouteToBe,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ListRoutes, loader } from './ListRoutes'

describe('List routes', () => {
  it('is possible to modify an existing route', async () => {
    mockRoutes({
      id: 'testRoute',
      label: 'Test route',
      initiator: ETH_ZERO_ADDRESS,
    })

    const { mockedPort } = await render(
      '/route-id/routes/list',
      [{ Component: ListRoutes, path: '/:activeRouteId/routes/list', loader }],
      {
        inspectRoutes: ['/:activeRouteId/routes/edit/:route-id'],
      },
    )

    await connectMockWallet(mockedPort, {
      accounts: [ZERO_ADDRESS],
      chainId: '0x1',
    })

    await userEvent.click(screen.getByRole('link', { name: 'Edit' }))

    await expectRouteToBe('/route-id/routes/edit/testRoute')
  })

  describe('Clearing transactions', () => {
    it('warns about clearing transactions when the avatars differ', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
      })

      mockRoutes(selectedRoute, { id: 'secondRoute', label: 'Second route' })

      await render(
        '/firstRoute/routes',
        [{ path: '/:activeRouteId/routes', Component: ListRoutes, loader }],
        {
          initialSelectedRoute: selectedRoute,
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

    it('warns about clearing transactions when the avatars differ', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
        avatar: ETH_ZERO_ADDRESS,
      })

      mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
        avatar: ETH_ZERO_ADDRESS,
      })

      await render(
        '/firstRoute/routes',
        [{ path: '/:activeRouteId/routes', Component: ListRoutes, loader }],
        {
          initialSelectedRoute: selectedRoute,
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

      mockRoutes(selectedRoute, { id: 'secondRoute', label: 'Second route' })

      await render(
        '/firstRoute/routes',
        [{ path: '/:activeRouteId/routes', Component: ListRoutes, loader }],
        {
          initialSelectedRoute: selectedRoute,
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
  })
})
