import { getRoute, getRoutes, saveLastUsedAccountId } from '@/execution-routes'
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
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { expectRouteToBe, randomPrefixedAddress } from '@zodiac/test-utils'
import type { MockTab } from '@zodiac/test-utils/chrome'
import { describe, expect, it, vi } from 'vitest'

describe('Root', () => {
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

      await render('/', {
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
      const { mockedTab } = await render('/')

      const route = createMockRoute()

      await mockIncomingRouteUpdate(route, mockedTab)

      await expect(getRoute(route.id)).resolves.toEqual(route)
    })

    it('saves the route when there are transactions but the route stays the same and the avatar has not changed', async () => {
      const route = await mockRoute()
      await saveLastUsedAccountId(route.id)

      const { mockedTab } = await render('/', {
        initialState: [createTransaction()],
      })

      const updatedRoute = { ...route, label: 'Changed label' }

      await mockIncomingRouteUpdate(updatedRoute, mockedTab)

      await expect(getRoute(route.id)).resolves.toEqual(updatedRoute)
    })

    it('provides the saved route back', async () => {
      const { mockedTab } = await render('/')

      const route = createMockRoute()

      await mockIncomingRouteUpdate(route, mockedTab)

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      } satisfies CompanionResponseMessage)
    })

    describe('Clearing transactions', () => {
      it('warns about clearing transactions when the avatars differ', async () => {
        const currentAvatar = randomPrefixedAddress()

        const currentRoute = createMockRoute({
          id: 'firstRoute',
          avatar: currentAvatar,
        })

        await mockRoutes(currentRoute)
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            avatar: randomPrefixedAddress(),
          },
          mockedTab,
        )

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
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            label: 'New label',
          },
          mockedTab,
        )

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
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        await mockIncomingRouteUpdate(
          createMockRoute({
            id: 'another-route',
            avatar: randomPrefixedAddress(),
          }),
          mockedTab,
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('does not warn when no route is currently selected', async () => {
        await saveLastUsedAccountId(null)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        await mockIncomingRouteUpdate(
          createMockRoute({
            id: 'another-route',
            avatar: randomPrefixedAddress(),
          }),
          mockedTab,
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
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/')

        await mockIncomingRouteUpdate(
          {
            ...currentRoute,
            avatar: randomPrefixedAddress(),
          },
          mockedTab,
        )

        expect(
          screen.queryByRole('dialog', { name: 'Clear transactions' }),
        ).not.toBeInTheDocument()
      })

      it('is saves the incoming route when the user accepts to clear transactions', async () => {
        const currentRoute = createMockRoute()

        await mockRoutes(currentRoute)
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

        await mockIncomingRouteUpdate(updatedRoute, mockedTab)

        await userEvent.click(
          screen.getByRole('button', { name: 'Clear transactions' }),
        )

        await expect(getRoute(currentRoute.id)).resolves.toEqual(updatedRoute)
      })

      it('clears transactions', async () => {
        const currentRoute = createMockRoute()

        await mockRoutes(currentRoute)
        await saveLastUsedAccountId(currentRoute.id)

        const { mockedTab } = await render('/', {
          initialState: [createTransaction()],
        })

        const updatedRoute = {
          ...currentRoute,
          avatar: randomPrefixedAddress(),
        }

        await mockIncomingRouteUpdate(updatedRoute, mockedTab)

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

      await saveLastUsedAccountId('test-route')

      const { mockedTab } = await render('/')

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
        } satisfies CompanionAppMessage,
        { id: chromeMock.runtime.id, tab: mockedTab },
        vi.fn(),
      )

      expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: 'test-route',
      } satisfies CompanionResponseMessage)
    })
  })
})
