import { render } from '@zodiac/test-utils'
import { describe, it } from 'vitest'
import EditRoute, { loader } from './edit-route'

describe('Edit route', () => {
  it('shows the name of a route', async () => {
    const route = {}

    await render('/edit-route', [
      { path: '/edit-route', Component: EditRoute, loader },
    ])
  })
})
