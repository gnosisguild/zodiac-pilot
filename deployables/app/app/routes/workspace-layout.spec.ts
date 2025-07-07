import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Workspace Layout', () => {
  describe('Admin link', () => {
    it('offers a link to the admin panel', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await workspaceFactory.create(tenant, user)

      await render(href('/'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('link', { name: 'System admin' }),
      ).toBeInTheDocument()
    })

    it('does not show the link in non-admin orgs', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await workspaceFactory.create(tenant, user)

      await render(href('/'), {
        user,
        tenant,
        isSystemAdmin: false,
      })

      expect(
        screen.queryByRole('link', { name: 'System admin' }),
      ).not.toBeInTheDocument()
    })
  })
})
