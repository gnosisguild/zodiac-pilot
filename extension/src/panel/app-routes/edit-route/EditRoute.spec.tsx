import { mockRoute, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EditRoute } from './EditRoute'

describe('Edit Zodiac route', () => {
  it('is possible to rename a route', async () => {
    mockRoute('route-id')

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
})
