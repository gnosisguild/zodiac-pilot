import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
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

  describe('Workspace switch', () => {
    it('is possible to switch the workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const workspace = await workspaceFactory.create(tenant, user, {
        label: 'Another workspace',
      })

      await render(
        href('/workspace/:workspaceId', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Workspace' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Another workspace' }),
      )

      await expectRouteToBe(
        href('/workspace/:workspaceId', { workspaceId: workspace.id }),
      )
    })

    it('defaults to the current workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user, {
        defaultWorkspaceLabel: 'Test workspace',
      })

      await workspaceFactory.create(tenant, user, {
        label: 'Another workspace',
      })

      await render(
        href('/workspace/:workspaceId', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      expect(await screen.findByText('Test workspace')).toBeInTheDocument()
    })

    it('hides the combobox when there is only one workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await render(
        href('/workspace/:workspaceId', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      expect(
        screen.queryByRole('combobox', { name: 'Workspace' }),
      ).not.toBeInTheDocument()
    })
  })
})
