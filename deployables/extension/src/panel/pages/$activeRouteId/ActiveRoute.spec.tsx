import { chromeMock, mockRoute, render } from '@/test-utils'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { describe, expect, it } from 'vitest'
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
})
