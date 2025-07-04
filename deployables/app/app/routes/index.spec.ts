import { render } from '@/test-utils'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, it } from 'vitest'

describe('Index', () => {
  it('redirects to the offline index when the user is not signed in', async () => {
    await render(href('/'))

    await expectRouteToBe(href('/offline'))
  })

  it('redirects to the default workspace when the user is signed in', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const workspace = await workspaceFactory.create(tenant, user)

    await render(href('/'), { tenant, user })

    await expectRouteToBe(
      href('/workspace/:workspaceId', { workspaceId: workspace.id }),
    )
  })
})
