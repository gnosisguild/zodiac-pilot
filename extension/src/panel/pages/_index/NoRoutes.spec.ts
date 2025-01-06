import {
  getLastUsedRouteId,
  getRoutes,
  saveLastUsedRouteId,
} from '@/execution-routes'
import {
  InjectedProviderMessageTyp,
  type InjectedProviderMessage,
} from '@/messages'
import {
  callListeners,
  chromeMock,
  createMockTab,
  expectRouteToBe,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

    it('shows an error when the user tries to connect a dApp', async () => {
      await render('/', [{ path: '/', Component: NoRoutes, loader, action }])

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: InjectedProviderMessageTyp.INJECTED_PROVIDER_REQUEST,
          request: { method: 'eth_accounts' },
          requestId: '1',
        } satisfies InjectedProviderMessage,
        { id: chromeMock.runtime.id, tab: createMockTab() },
        vi.fn(),
      )

      expect(
        screen.getByRole('alert', { name: 'No active route' }),
      ).toHaveAccessibleDescription(
        'In order to connect Zodiac Pilot to a dApp you first need to create a route.',
      )
    })
  })
})
