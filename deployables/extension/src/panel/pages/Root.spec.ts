import { getUser } from '@/companion'
import { getRoutes, saveLastUsedAccountId } from '@/execution-routes'
import {
  callListeners,
  chromeMock,
  createConfirmedTransaction,
  mockRoute,
  mockRoutes,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
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
        initialState: { executed: [createConfirmedTransaction()] },
      })

      await mockIncomingDelete('test-route', mockedTab)

      expect(
        await screen.findByRole('alert', { name: 'No transactions' }),
      ).toHaveAccessibleDescription(
        'As you interact with apps in the browser, transactions will be recorded here. You can then sign and submit them as a batch.',
      )
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
