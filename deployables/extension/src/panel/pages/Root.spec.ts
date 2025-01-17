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
import { expectRouteToBe, randomPrefixedAddress } from '@zodiac/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { loader, Root } from './Root'

const mockIncomingRouteUpdate = async (route: ExecutionRoute) => {
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

    await mockIncomingRouteUpdate(route)

    await expect(getRoute(route.id)).resolves.toEqual(route)
  })

  describe('Clearing transactions', () => {
    it('warns about clearing transactions when the avatars differ', async () => {
      const currentAvatar = randomPrefixedAddress()

      const currentRoute = createMockRoute({
        id: 'firstRoute',
        avatar: currentAvatar,
      })

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render(
        '/',
        [
          {
            path: '/',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await mockIncomingRouteUpdate({
        ...currentRoute,
        avatar: randomPrefixedAddress(),
      })

      expect(
        await screen.findByRole('dialog', { name: 'Clear transactions' }),
      ).toBeInTheDocument()
    })

    it('does not warn about clearing transactions when the avatars stay the same', async () => {
      const currentRoute = createMockRoute({
        id: 'firstRoute',
        avatar: randomPrefixedAddress(),
      })

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render(
        '/',
        [
          {
            path: '/',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await mockIncomingRouteUpdate({
        ...currentRoute,
        label: 'New label',
      })

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('does not warn when the route differs from the currently active one', async () => {
      const currentRoute = createMockRoute({
        id: 'firstRoute',
        avatar: randomPrefixedAddress(),
      })

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render(
        '/',
        [
          {
            path: '/',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await mockIncomingRouteUpdate(
        createMockRoute({
          id: 'another-route',
          avatar: randomPrefixedAddress(),
        }),
      )

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('does not warn when no route is currently selected', async () => {
      await saveLastUsedRouteId(null)

      await render(
        '/',
        [
          {
            path: '/',
            Component: Root,
            loader,
          },
        ],
        {
          initialState: [createTransaction()],
        },
      )

      await mockIncomingRouteUpdate(
        createMockRoute({
          id: 'another-route',
          avatar: randomPrefixedAddress(),
        }),
      )

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('should not warn about clearing transactions when there are none', async () => {
      const currentRoute = createMockRoute({
        id: 'firstRoute',
        avatar: randomPrefixedAddress(),
      })

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render('/', [
        {
          path: '/',
          Component: Root,
          loader,
        },
      ])

      await mockIncomingRouteUpdate({
        ...currentRoute,
        avatar: randomPrefixedAddress(),
      })

      expect(
        screen.queryByRole('dialog', { name: 'Clear transactions' }),
      ).not.toBeInTheDocument()
    })

    it('is saves the incoming route when the user accepts to clear transactions', async () => {
      const currentRoute = createMockRoute()

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render(
        '/',
        [
          {
            path: '/',
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

      const updatedRoute = { ...currentRoute, avatar: randomPrefixedAddress() }

      await mockIncomingRouteUpdate(updatedRoute)

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear transactions' }),
      )

      await expect(getRoute(currentRoute.id)).resolves.toEqual(updatedRoute)
    })

    it('clears transactions', async () => {
      const currentRoute = createMockRoute()

      await mockRoutes(currentRoute)
      await saveLastUsedRouteId(currentRoute.id)

      await render(
        '/',
        [
          {
            path: '/',
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

      const updatedRoute = { ...currentRoute, avatar: randomPrefixedAddress() }

      await mockIncomingRouteUpdate(updatedRoute)

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear transactions' }),
      )

      await expectRouteToBe(
        `/${currentRoute.id}/clear-transactions/${currentRoute.id}`,
      )
    })
  })
})
