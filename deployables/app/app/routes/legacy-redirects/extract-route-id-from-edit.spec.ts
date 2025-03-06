import { render } from '@/test-utils'
import { encode } from '@zodiac/schema'
import { createMockRoute, expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, it } from 'vitest'

describe('Legacy redirect', () => {
  it('extracts the route id', async () => {
    const route = createMockRoute()

    await render(href('/edit/:data', { data: encode(route) }))

    await expectRouteToBe(
      href('/edit/:routeId/:data', { routeId: route.id, data: encode(route) }),
    )
  })
})
