import { getUser } from '@/companion'
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
import type { Account } from '@zodiac/db/schema'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import {
  createMockExecutionRoute,
  expectRouteToBe,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import type { MockTab } from '@zodiac/test-utils/chrome'
import { describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.mocked(getUser)

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

      const { mockedTab } = await render('/')

      await mockIncomingDelete('test-route', mockedTab)

      await expect(getRoutes()).resolves.toEqual([])
    })

    it('clears all current transactions', async () => {
      await mockRoutes({ id: 'test-route' }, { id: 'another-route' })

      const { mockedTab } = await render('/', {
        initialState: { done: [createTransaction()] },
      })

      await mockIncomingDelete('test-route', mockedTab)

      expect(
        await screen.findByRole('alert', { name: 'No transactions' }),
      ).toHaveAccessibleDescription(
        'As you interact with apps in the browser, transactions will be recorded here. You can then sign and submit them as a batch.',
      )
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
        initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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
          initialState: { done: [createTransaction()] },
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

  describe('Save and launch', () => {
    const mockIncomingAccountLaunch = async (
      { route, account }: { route: ExecutionRoute; account?: Account },
      tab: MockTab = createMockTab(),
    ) => {
      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.SAVE_AND_LAUNCH,
          data: route,
          account,
        },
        { id: chromeMock.runtime.id, tab },
        vi.fn(),
      )
    }

    it('is possible to save and launch a remote account', async () => {
      const tenant = tenantFactory.createWithoutDb()
      const user = userFactory.createWithoutDb(tenant)
      const account = accountFactory.createWithoutDb(tenant, user)

      const { mockedTab } = await render('/')

      mockIncomingAccountLaunch(
        { route: createMockExecutionRoute(), account },
        mockedTab,
      )

      await expectRouteToBe(`/${account.id}/transactions`)
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

  describe('User', () => {
    it('fetches the current user, when a ping signals a change of the signed in state', async () => {
      await mockRoute({ id: 'test-route' })

      await saveLastUsedAccountId('test-route')

      const { mockedTab } = await render('/')

      const callCount = mockGetUser.mock.calls.length

      await callListeners(
        chromeMock.runtime.onMessage,
        {
          type: CompanionAppMessageType.PING,
          signedIn: true,
        } satisfies CompanionAppMessage,
        { id: chromeMock.runtime.id, tab: mockedTab },
        vi.fn(),
      )

      expect(mockGetUser).toHaveBeenCalledTimes(callCount + 1)
    })
  })
})
