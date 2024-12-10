import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import {
  connectMockWallet,
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
      }
    )

    await connectMockWallet(mockedPort, {
      accounts: [ZERO_ADDRESS],
      chainId: '0x1',
    })

    await userEvent.click(screen.getByRole('link', { name: 'Edit' }))

    await expectRouteToBe('/routes/testRoute')
  })

  it('should not warn about clearing transactions when there are none', async () => {
    mockRoutes(
      { id: 'firstRoute', label: 'First route' },
      { id: 'secondRoute', label: 'Second route' }
    )

    await render('/routes', [{ path: '/routes', Component: ListRoutes }], {
      initialSelectedRouteId: 'firstRoute',
    })

    const { getByRole } = within(
      screen.getByRole('region', { name: 'Second route' })
    )

    await userEvent.click(getByRole('button', { name: 'Launch' }))

    expect(
      screen.queryByRole('dialog', { name: 'Clear transactions' })
    ).not.toBeInTheDocument()
  })
})
