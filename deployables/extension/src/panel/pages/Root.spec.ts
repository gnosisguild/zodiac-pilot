import { getRoute, saveLastUsedRouteId } from '@/execution-routes'
import {
  callListeners,
  chromeMock,
  createMockRoute,
  createTransaction,
  mockRoutes,
  render,
} from '@/test-utils'
import type { ExecutionRoute } from '@/types'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanionAppMessageType } from '@zodiac/messages'
import {
  expectRouteToBe,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { parsePrefixedAddress } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'
import { loader, Root } from './Root'

const mockSave = async (route: ExecutionRoute) => {
  await callListeners(
    chromeMock.runtime.onMessage,
    {
      type: CompanionAppMessageType.SAVE_ROUTE,
      data: route,
    },
    { id: chromeMock.runtime.id },
    vi.fn(),
  )
}

describe('Root', () => {
  it('stores route data it receives from the companion app', async () => {
    await render('/', [{ path: '/', Component: Root, loader }])

    const route = createMockRoute()

    await mockSave(route)

    await expect(getRoute(route.id)).resolves.toEqual(route)
  })

  describe.skip('Clearing transactions', () => {
    it('warns about clearing transactions when the avatars differ', async () => {
      const currentAvatar = randomPrefixedAddress()
      const newAvatar = randomAddress()

      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        avatar: currentAvatar,
      })

      await mockRoutes(selectedRoute)
      await saveLastUsedRouteId(selectedRoute.id)

      await render(
        '/routes/edit/firstRoute',
        [
          {
            path: '/routes/edit/:routeId',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear piloted Safe' }),
      )
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Piloted Safe' }),
        newAvatar,
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      expect(
        screen.getByRole('dialog', { name: 'Clear transactions' }),
      ).toBeInTheDocument()
    })

    it('does not warn about clearing transactions when the avatars stay the same', async () => {
      const avatar = randomPrefixedAddress()

      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
        avatar,
      })

      await mockRoutes(selectedRoute)
      await saveLastUsedRouteId(selectedRoute.id)

      await render(
        '/routes/edit/firstRoute',
        [
          {
            path: '/routes/edit/:routeId',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear piloted Safe' }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Piloted Safe' }),
        parsePrefixedAddress(avatar),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('should not warn about clearing transactions when there are none', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
        avatar: randomPrefixedAddress(),
      })

      await mockRoutes(selectedRoute)
      await saveLastUsedRouteId(selectedRoute.id)

      await render('/routes/edit/firstRoute', [
        {
          path: '/routes/edit/:routeId',
          Component: Root,
          loader,
        },
      ])

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear piloted Safe' }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Piloted Safe' }),
        randomAddress(),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('is possible to launch a new route and clear transactions', async () => {
      const selectedRoute = createMockRoute({
        id: 'firstRoute',
        label: 'First route',
        avatar: randomPrefixedAddress(),
      })

      await mockRoutes(selectedRoute, {
        id: 'another-route',
        avatar: randomPrefixedAddress(),
      })
      await saveLastUsedRouteId('another-route')

      await render(
        '/routes/edit/firstRoute',
        [
          {
            path: '/routes/edit/:routeId',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
          inspectRoutes: [
            '/:activeRouteId/clear-transactions/:newActiveRouteId',
          ],
        },
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear piloted Safe' }),
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Piloted Safe' }),
        randomAddress(),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Save & Launch' }),
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear transactions' }),
      )

      await expectRouteToBe('/another-route/clear-transactions/firstRoute')
    })
  })
})
