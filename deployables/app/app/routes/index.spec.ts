import { render } from '@/test-utils'
import { dbIt, tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe } from 'vitest'

describe('Index', () => {
  dbIt(
    'redirects to the offline index when the user is not signed in',
    async () => {
      await render(href('/'))

      await expectRouteToBe(href('/offline'))
    },
  )

  dbIt(
    'redirects to the default workspace when the user is signed in',
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
