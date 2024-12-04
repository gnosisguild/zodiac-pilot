import { ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@/chains'
import {
  connectMockWallet,
  expectRouteToBe,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it } from 'vitest'
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
})
