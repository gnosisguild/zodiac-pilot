import { saveLastUsedRouteId } from '@/execution-routes'
import { expectRouteToBe, render } from '@/test-utils'
import { describe, it } from 'vitest'
import { action, loader, NoRoutes } from './NoRoutes'

describe('No routes', () => {
  describe('Default redirects', () => {
    it('redirects to the last used route if one is present', async () => {
      await saveLastUsedRouteId('test-route')

      await render('/', [{ path: '/', Component: NoRoutes, loader, action }], {
        inspectRoutes: ['/:activeRouteId'],
      })

      await expectRouteToBe('/test-route')
    })
  })
})
