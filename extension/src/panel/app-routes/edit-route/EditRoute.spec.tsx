import { chromeMock, expectRouteToBe, mockRoute, render } from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EditRoute } from './EditRoute'

describe('Edit Zodiac route', () => {
  it('is possible to rename a route', async () => {
    mockRoute({ id: 'route-id' })

    await render('/routes/route-id', [
      {
        path: '/routes/:routeId',
        Component: EditRoute,
      },
    ])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Route label' }),
      'Test route'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save & Launch' }))

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      'routes[route-id]': expect.objectContaining({ label: 'Test route' }),
    })
  })

  describe('Remove', () => {
    it('is possible to remove a route', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' })
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' })
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      expect(chromeMock.storage.sync.remove).toHaveBeenCalledWith(
        'routes[route-id]'
      )
    })

    it('does not remove the route if the user cancels', async () => {
      mockRoute({ id: 'route-id' })

      await render('/routes/route-id', [
        {
          path: '/routes/:routeId',
          Component: EditRoute,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' })
      )

      const { getAllByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' })
      )

      await userEvent.click(getAllByRole('button', { name: 'Cancel' })[0])

      expect(chromeMock.storage.sync.remove).not.toHaveBeenCalledWith()
    })

    it('navigates back to all routes after remove', async () => {
      mockRoute({ id: 'route-id' })

      await render(
        '/routes/route-id',
        [
          {
            path: '/routes/:routeId',
            Component: EditRoute,
          },
        ],
        { inspectRoutes: ['/routes'] }
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Remove route' })
      )

      const { getByRole } = within(
        screen.getByRole('dialog', { name: 'Remove route' })
      )

      await userEvent.click(getByRole('button', { name: 'Remove' }))

      await expectRouteToBe('/routes')
    })
  })
})
