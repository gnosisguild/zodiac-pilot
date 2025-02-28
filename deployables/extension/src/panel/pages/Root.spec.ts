import { getRoute, getRoutes, saveLastUsedRouteId } from '@/execution-routes'
import {
  callListeners,
  chromeMock,
  createMockRoute,
  createMockTab,
  createTransaction,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import type { ExecutionRoute } from '@/types'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ETH_ZERO_ADDRESS } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { expectRouteToBe, randomPrefixedAddress } from '@zodiac/test-utils'
import type { MockTab } from '@zodiac/test-utils/chrome'
import { Outlet } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { action, loader, Root } from './Root'

describe('Root', () => {
  describe('Launch route', () => {
    const mockIncomingLaunch = async (routeId: string, tab: MockTab) => {
      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.LAUNCH_ROUTE,
          routeId,
        } satisfies CompanionAppMessage,
        { id: chromeMock.runtime.id, tab },
        vi.fn(),
      )
    }

    it('is possible to launch a route', async () => {
      await mockRoute({ id: 'test-route' })
      const activeTab = createMockTab()

      await render('/', [{ path: '/', Component: Root, loader, action }], {
        inspectRoutes: ['/:activeRouteId'],
        activeTab,
      })

      mockIncomingLaunch('test-route', activeTab)

      await expectRouteToBe('/test-route')
    })

    it('communicates the new route id', async () => {
      const activeTab = createMockTab()

      await mockRoute({ id: 'test-route' })

      await render(
        '/',
        [
          {
            path: '/',
            Component: Root,
            loader,
            action,
            children: [{ path: ':activeRouteId', Component: Outlet }],
          },
        ],
        {
          activeTab,
        },
      )

      await mockIncomingLaunch('test-route', activeTab)

      await waitFor(() => {
        expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(activeTab.id, {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: 'test-route',
        } satisfies CompanionResponseMessage)
      })
    })

    it('is possible to launch a new route and clear transactions', async () => {
      const activeTab = createMockTab()

      const selectedRoute = createMockRoute({
        avatar: randomPrefixedAddress(),
        id: 'firstRoute',
        label: 'First route',
      })

      await saveLastUsedRouteId('firstRoute')

      mockRoutes(selectedRoute, {
        id: 'secondRoute',
        label: 'Second route',
        avatar: randomPrefixedAddress(),
      })

      await render('/', [{ path: '/', Component: Root, loader, action }], {
        initialState: [createTransaction()],
        activeTab,
        inspectRoutes: ['/:activeRouteId/clear-transactions/:newRootId'],
      })

      await mockIncomingLaunch('secondRoute', activeTab)

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear transactions' }),
      )

      await expectRouteToBe('/firstRoute/clear-transactions/secondRoute')
    })

    describe('Clearing transactions', () => {
      it('warns about clearing transactions when the avatars differ', async () => {
        const activeTab = createMockTab()

        const selectedRoute = createMockRoute({
          avatar: randomPrefixedAddress(),
          id: 'firstRoute',
          label: 'First route',
        })

        await mockRoutes(selectedRoute, {
          avatar: randomPrefixedAddress(),
          id: 'secondRoute',
          label: 'Second route',
        })
        await saveLastUsedRouteId(selectedRoute.id)

        await render('/', [{ path: '/', Component: Root, loader }], {
          initialState: [createTransaction()],
          activeTab,
        })

        await mockIncomingLaunch('secondRoute', activeTab)

        expect(
          screen.getByRole('dialog', { name: 'Clear transactions' }),
        ).toBeInTheDocument()
      })

      it('does not warn about clearing transactions when the avatars stay the same', async () => {
        const activeTab = createMockTab()

        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          label: 'First route',
          avatar: ETH_ZERO_ADDRESS,
        })

        await mockRoutes(selectedRoute, {
          id: 'secondRoute',
          label: 'Second route',
          avatar: ETH_ZERO_ADDRESS,
        })
        await saveLastUsedRouteId(selectedRoute.id)

        await render('/', [{ path: '/', Component: Root, loader }], {
          initialState: [createTransaction()],
          activeTab,
          inspectRoutes: ['/:activeRouteId'],
        })

        await mockIncomingLaunch('secondRoute', activeTab)

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('should not warn about clearing transactions when there are none', async () => {
        const activeTab = createMockTab()

        const selectedRoute = createMockRoute({
          id: 'firstRoute',
          label: 'First route',
          avatar: randomPrefixedAddress(),
        })

        await mockRoutes(selectedRoute, {
          id: 'secondRoute',
          label: 'Second route',
          avatar: randomPrefixedAddress(),
        })

        await saveLastUsedRouteId(selectedRoute.id)

        await render('/', [{ path: '/', Component: Root, loader }], {
          inspectRoutes: ['/:activeRouteId'],
          activeTab,
        })

        await mockIncomingLaunch('secondRoute', activeTab)

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Delete route', () => {
    const mockIncomingDelete = async (routeId: string, tab: MockTab) => {
      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId,
        } satisfies CompanionAppMessage,
        { id: chromeMock.runtime.id, tab },
        vi.fn(),
      )
    }

    it('removes the route', async () => {
      await mockRoutes({ id: 'test-route' })
      const tab = createMockTab()

      await render('/', [{ path: '/', Component: Root, loader }], {
        activeTab: tab,
      })

      await mockIncomingDelete('test-route', tab)

      await expect(getRoutes()).resolves.toEqual([])
    })
  })

  describe('Save route', () => {
    const mockIncomingRouteUpdate = async (
      route: ExecutionRoute,
      tab: MockTab = createMockTab(),
    ) => {
      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.SAVE_ROUTE,
          data: route,
        },
        { id: chromeMock.runtime.id, tab },
        vi.fn(),
      )
    }

    it('stores route data it receives from the companion app', async () => {
      await render('/', [{ path: '/', Component: Root, loader }])

      const route = createMockRoute()

      await mockIncomingRouteUpdate(route)

      await expect(getRoute(route.id)).resolves.toEqual(route)
    })

    it('saves the route when there are transactions but the route stays the same and the avatar has not changed', async () => {
      const route = await mockRoute()
      await saveLastUsedRouteId(route.id)

      await render('/', [{ path: '/', Component: Root, loader }], {
        initialState: [createTransaction()],
      })

      const updatedRoute = { ...route, label: 'Changed label' }

      await mockIncomingRouteUpdate(updatedRoute)

      await expect(getRoute(route.id)).resolves.toEqual(updatedRoute)
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

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

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

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

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

  describe('Active route', () => {
    it('answers when queried for the currently active route', async () => {
      await mockRoute({ id: 'test-route' })

      await saveLastUsedRouteId('test-route')

      const { mockedTab } = await render('/', [
        { path: '/', Component: Root, loader },
      ])

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
        } satisfies CompanionAppMessage,
        { id: chromeMock.runtime.id, tab: mockedTab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenNthCalledWith(
        2,
        mockedTab.id,
        {
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: 'test-route',
        } satisfies CompanionResponseMessage,
      )
    })
  })
})
