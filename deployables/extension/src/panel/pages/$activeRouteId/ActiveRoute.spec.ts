import {
  chromeMock,
  mockCompanionAppUrl,
  mockRoute,
  render,
} from '@/test-utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { describe, expect, it } from 'vitest'

mockCompanionAppUrl('http://companion-app.com')

describe('Active Route', () => {
  it('communicates the new active route', async () => {
    await mockRoute({ id: 'first-route', label: 'First route' })

    const { mockedTab } = await render('/first-route', {
      activeTab: { url: getCompanionAppUrl() },
    })

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: 'first-route',
    } satisfies CompanionResponseMessage)
  })
})
