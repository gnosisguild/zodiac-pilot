import { render } from '@/test-utils'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, it } from 'vitest'

describe('Load default workspace', () => {
  it('redirects to the welcome page when the user is not logged in', async () => {
    await render(href('/'))

    await expectRouteToBe(href('/welcome'))
  })

  it('redirects to the first workspace in the system when the user is logged in', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const workspace = await workspaceFactory.create(tenant, user)

    await render(href('/'), { tenant, user })

    await expectRouteToBe(href('/:workspaceId', { workspaceId: workspace.id }))
  })
})
