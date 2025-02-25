import { callListeners, chromeMock, mockRoute, render } from '@/test-utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { describe, expect, it, vi } from 'vitest'
import { ActiveRoute, loader } from './ActiveRoute'

describe('Active route', () => {
  it('notifies the companion app about the active route', async () => {
    await mockRoute({ id: 'test-route' })

    const { mockedTab } = await render('/test-route', [
      { path: '/:activeRouteId', Component: ActiveRoute, loader },
    ])

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: 'test-route',
    } satisfies CompanionResponseMessage)
  })

  it('answers when queried for the currently active route', async () => {
    await mockRoute({ id: 'test-route' })

    const { mockedTab } = await render('/test-route', [
      { path: '/:activeRouteId', Component: ActiveRoute, loader },
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
