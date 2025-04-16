import { getRemoteAccount, saveRemoteActiveAccount } from '@/companion'
import {
  chromeMock,
  mockCompanionAppUrl,
  mockRoute,
  render,
} from '@/test-utils'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionResponseMessageType,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { describe, expect, it, vi } from 'vitest'

mockCompanionAppUrl('http://companion-app.com')

const mockGetRemoteAccount = vi.mocked(getRemoteAccount)

describe('Active Account', () => {
  it('communicates the new active route as an event', async () => {
    await mockRoute({ id: 'first-route', label: 'First route' })

    const { mockedTab } = await render('/first-route', {
      activeTab: { url: getCompanionAppUrl() },
    })

    expect(chromeMock.tabs.sendMessage).toHaveBeenCalledWith(mockedTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: 'first-route',
    } satisfies CompanionResponseMessage)
  })

  it('tries to store the new active account on the remote', async () => {
    const tenant = tenantFactory.createWithoutDb()
    const user = userFactory.createWithoutDb(tenant)

    const account = accountFactory.createWithoutDb(tenant, user, {
      id: 'test-account',
    })

    mockGetRemoteAccount.mockResolvedValue(account)

    await render('/test-account')

    expect(saveRemoteActiveAccount).toHaveBeenCalledWith(
      account,
      expect.anything(),
    )
  })
})
