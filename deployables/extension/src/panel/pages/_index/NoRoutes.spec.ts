import { saveLastUsedRouteId } from '@/execution-routes'
import { mockProviderRequest, mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { loader, NoRoutes } from './NoRoutes'

describe('No routes', () => {
  describe('Default redirects', () => {
    it('redirects to the last used route if one is present', async () => {
      await saveLastUsedRouteId('test-route')

      await render('/', [{ path: '/', Component: NoRoutes, loader }], {
        inspectRoutes: ['/:activeRouteId'],
      })

      await expectRouteToBe('/test-route')
    })

    it('redirects to the first route if no route was last used', async () => {
      await mockRoutes({ id: 'first-route' }, { id: 'second-route' })

      await render('/', [{ path: '/', Component: NoRoutes, loader }], {
        inspectRoutes: ['/:activeRouteId'],
      })

      await expectRouteToBe('/first-route')
    })
  })

  describe('No routes available', () => {
    it('allows to create a new route', async () => {
      await render('/', [{ path: '/', Component: NoRoutes, loader }], {
        companionAppUrl: 'http://localhost',
      })

      expect(screen.getByRole('link', { name: 'Add route' })).toHaveAttribute(
        'href',
        'http://localhost/create',
      )
    })

    it('shows an error when the user tries to connect a dApp', async () => {
      await render('/', [{ path: '/', Component: NoRoutes, loader }])

      await mockProviderRequest()

      expect(
        screen.getByRole('alert', { name: 'No active route' }),
      ).toHaveAccessibleDescription(
        'To use Zodiac Pilot with a dApp you need to create a route.',
      )
    })
  })
})
