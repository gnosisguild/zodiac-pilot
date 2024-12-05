import { ETH_ZERO_ADDRESS } from '@/chains'
import { expectRouteToBe, mockRoutes, render } from '@/test-utils'
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

    await render('/routes', [{ Component: ListRoutes, path: '/routes' }], {
      inspectRoutes: ['/routes/:route-id'],
    })

    await userEvent.click(screen.getByRole('link', { name: 'Edit' }))

    await expectRouteToBe('/routes/testRoute')
  })

  it('is possible to create a new route', async () => {
    mockRoutes()

    await render('/routes', [{ Component: ListRoutes, path: '/routes' }], {
      inspectRoutes: ['/routes/new'],
    })

    await userEvent.click(screen.getByRole('link', { name: 'Add route' }))

    await expectRouteToBe('/routes/new')
  })
})
