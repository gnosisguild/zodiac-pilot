import {
  getLastUsedRouteId,
  getRoutes,
  saveLastUsedRouteId,
} from '@/execution-routes'
import { expectRouteToBe, mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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

    it('redirects to the first route if no route was last used', async () => {
      await mockRoutes({ id: 'first-route' }, { id: 'second-route' })

      await render('/', [{ path: '/', Component: NoRoutes, loader, action }], {
        inspectRoutes: ['/:activeRouteId'],
      })

      await expectRouteToBe('/first-route')
    })
  })

  describe('No routes available', () => {
    it('allows to create a new route', async () => {
      await render('/', [{ path: '/', Component: NoRoutes, loader, action }], {
        inspectRoutes: ['/routes/edit/:routeId'],
      })

      await userEvent.click(screen.getByRole('button', { name: 'Add route' }))

      const [newRoute] = await getRoutes()

      await expectRouteToBe(`/routes/edit/${newRoute.id}`)
    })

    it('marks the new route as the last used one', async () => {
      await render('/', [{ path: '/', Component: NoRoutes, loader, action }], {
        inspectRoutes: ['/routes/edit/:routeId'],
      })

      await userEvent.click(screen.getByRole('button', { name: 'Add route' }))

      const [newRoute] = await getRoutes()

      await expect(getLastUsedRouteId()).resolves.toEqual(newRoute.id)
    })
  })
})
