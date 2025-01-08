import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { createMockExecutionRoute } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import EditRoute, { loader } from './edit-route'

describe('Edit route', () => {
  it('shows the name of a route', async () => {
    const route = createMockExecutionRoute({ label: 'Test route' })

    await render(
      '/edit-route',
      { path: '/edit-route', Component: EditRoute, loader },
      { searchParams: { route: btoa(JSON.stringify(route)) } },
    )

    expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue(
      'Test route',
    )
  })
})
