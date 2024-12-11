import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import {
  connectMockWallet,
  createTransaction,
  expectRouteToBe,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ListRoutes } from './ListRoutes'

describe('List routes', () => {
  it('is possible to modify an existing route', async () => {
    mockRoutes({
      id: 'testRoute',
      label: 'Test route',
      initiator: ETH_ZERO_ADDRESS,
    })

    const { mockedPort } = await render(
      '/routes',
      [{ Component: ListRoutes, path: '/routes' }],
      {
        inspectRoutes: ['/routes/:route-id'],
      },
    )

    await connectMockWallet(mockedPort, {
      accounts: [ZERO_ADDRESS],
      chainId: '0x1',
    })

    await userEvent.click(screen.getByRole('link', { name: 'Edit' }))

    await expectRouteToBe('/routes/testRoute')
  })

  describe('Clearing transactions', () => {
    it('warns about clearing transactions when the avatars differ', async () => {
      mockRoutes(
        { id: 'firstRoute', label: 'First route' },
        { id: 'secondRoute', label: 'Second route' },
      )

      await render('/routes', [{ path: '/routes', Component: ListRoutes }], {
        initialSelectedRouteId: 'firstRoute',
        initialState: [createTransaction()],
      })

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))

      expect(
        screen.getByRole('dialog', { name: 'Clear transactions' }),
      ).toBeInTheDocument()
    })

    it('warns about clearing transactions when the avatars differ', async () => {
      mockRoutes(
        { id: 'firstRoute', label: 'First route', avatar: ETH_ZERO_ADDRESS },
        { id: 'secondRoute', label: 'Second route', avatar: ETH_ZERO_ADDRESS },
      )

      await render('/routes', [{ path: '/routes', Component: ListRoutes }], {
        initialSelectedRouteId: 'firstRoute',
        initialState: [createTransaction()],
      })

      const { getByRole } = within(
        screen.getByRole('region', { name: 'Second route' }),
      )

      await userEvent.click(getByRole('button', { name: 'Launch' }))

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('should not warn about clearing transactions when there are none', async () => {
      mockRoutes(
        { id: 'firstRoute', label: 'First route' },
        { id: 'secondRoute', label: 'Second route' },
      )

      await render('/routes', [{ path: '/routes', Component: ListRoutes }], {
        initialSelectedRouteId: 'firstRoute',
      })

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
