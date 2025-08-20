import { render } from '@/test-utils'
import {
  dbIt,
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
} from '@zodiac/messages'
import { createMockExecutionRoute } from '@zodiac/modules/test-utils'
import { encode } from '@zodiac/schema'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, it } from 'vitest'

describe('Load local account', () => {
  it('redirects to the offline version for local accounts when no user is logged in', async () => {
    const route = createMockExecutionRoute({ id: 'test-account' })

    await render(
      href('/offline/accounts/:accountId', { accountId: 'test-account' }),
      {
        autoRespond: {
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
      },
    )

    await expectRouteToBe(
      href('/offline/accounts/:accountId/:data', {
        accountId: 'test-account',
        data: encode(route),
      }),
    )
  })

  dbIt(
    'redirects to the local logged in version for local accounts when the user is logged in',
    async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const route = createMockExecutionRoute({ id: 'test-account' })

      await render(
        href('/offline/accounts/:accountId', { accountId: 'test-account' }),
        {
          tenant,
          user,
          autoRespond: {
            [CompanionAppMessageType.REQUEST_ROUTE]: {
              type: CompanionResponseMessageType.PROVIDE_ROUTE,
              route,
            },
          },
        },
      )

      await expectRouteToBe(
        href('/workspace/:workspaceId/local-accounts/:accountId/:data', {
          workspaceId: tenant.defaultWorkspaceId,
          accountId: 'test-account',
          data: encode(route),
        }),
      )
    },
  )

  dbIt(
    'keeps the current workspace selected when the user is logged in',
    async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)

      const route = createMockExecutionRoute({ id: 'test-account' })

      await render(
        href('/workspace/:workspaceId/local-accounts/:accountId', {
          workspaceId: workspace.id,
          accountId: 'test-account',
        }),
        {
          tenant,
          user,
          autoRespond: {
            [CompanionAppMessageType.REQUEST_ROUTE]: {
              type: CompanionResponseMessageType.PROVIDE_ROUTE,
              route,
            },
          },
        },
      )

      await expectRouteToBe(
        href('/workspace/:workspaceId/local-accounts/:accountId/:data', {
          workspaceId: workspace.id,
          accountId: 'test-account',
          data: encode(route),
        }),
      )
    },
  )
})
