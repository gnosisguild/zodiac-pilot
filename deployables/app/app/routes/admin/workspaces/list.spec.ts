import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getWorkspace } from '@zodiac/db'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Workspaces', () => {
  describe('List', () => {
    it('lists all workspaces', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user, {
        defaultWorkspaceLabel: 'Default workspace',
      })

      await workspaceFactory.create(tenant, user, {
        label: 'Another workspace',
      })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('cell', { name: 'Default workspace' }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('cell', { name: 'Another workspace' }),
      ).toBeInTheDocument()
    })
  })

  describe('Add workspace', () => {
    it('is possible to add a new workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user, {
        defaultWorkspaceLabel: 'Default workspace',
      })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('link', { name: 'Add new workspace' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'New workspace',
      )
      await userEvent.click(await screen.getByRole('button', { name: 'Add' }))

      expect(
        await screen.findByRole('cell', { name: 'New workspace' }),
      ).toBeInTheDocument()
    })
  })

  describe('Edit', () => {
    it('is possible to rename a workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user, {
        defaultWorkspaceLabel: 'Workspace',
      })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Workspace options' }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        ' updated',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      expect(
        getWorkspace(dbClient(), tenant.defaultWorkspaceId),
      ).toHaveProperty('label', 'Workspace updated')
    })
  })
})
