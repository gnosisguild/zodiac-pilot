import { saveLastUsedRouteId } from '@/execution-routes'
import {
  mockCompanionAppUrl,
  mockProviderRequest,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'

describe('No routes', () => {
  describe('Default redirects', () => {
    it('redirects to the last used route if one is present', async () => {
      await mockRoute({ id: 'test-route' })
      await saveLastUsedRouteId('test-route')

      await render('/')

      await expectRouteToBe('/test-route/transactions')
    })

    it('redirects to the first route if no route was last used', async () => {
      await mockRoutes({ id: 'first-route' }, { id: 'second-route' })

      await render('/')

      await expectRouteToBe('/first-route/transactions')
    })
  })

  describe('No routes available', () => {
    it('allows to create a new route', async () => {
      mockCompanionAppUrl('http://localhost')

      await render('/')

      expect(screen.getByRole('link', { name: 'Add route' })).toHaveAttribute(
        'href',
        'http://localhost/create',
      )
    })

    it('shows an error when the user tries to connect a dApp', async () => {
      await render('/')

      await mockProviderRequest()

      expect(
        screen.getByRole('alert', { name: 'No active route' }),
      ).toHaveAccessibleDescription(
        'To use Zodiac Pilot with a dApp you need to create a route.',
      )
    })
  })
})
