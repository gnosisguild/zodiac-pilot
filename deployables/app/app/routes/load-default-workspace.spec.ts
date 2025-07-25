import { render } from '@/test-utils'
import { dbIt, tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe } from 'vitest'

describe('Load default workspace', () => {
  dbIt(
    'redirects to the welcome page when the user is not logged in',
    async () => {
      await render(href('/'))

      await expectRouteToBe(href('/offline'))
    },
  )

  dbIt(
    'redirects to the first workspace in the system when the user is logged in',
    async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await render(href('/'), { tenant, user })

      await expectRouteToBe(
        href('/workspace/:workspaceId', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    },
  )
})
