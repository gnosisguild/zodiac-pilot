import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getWorkspace, getWorkspaces } from '@zodiac/db'
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

      const { waitForPendingActions } = await render(
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

      await waitForPendingActions()

      await expect(
        getWorkspace(dbClient(), tenant.defaultWorkspaceId),
      ).resolves.toHaveProperty('label', 'Workspace updated')
    })

    it.todo('is possible to set a workspace as the default one')
  })

  describe('Remove', () => {
    it('is possible to remove a workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await workspaceFactory.create(tenant, user, { label: 'Test workspace' })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Workspace options',
          description: 'Test workspace',
        }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Remove' }))

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )

      await expect(
        getWorkspaces(dbClient(), { tenantId: tenant.id }),
      ).resolves.toEqual([
        await getWorkspace(dbClient(), tenant.defaultWorkspaceId),
      ])
    })
    it.todo('is not possible to remove the default workspace')

    describe('Accounts', () => {
      it.todo('is possible to move accounts to a different workspace')
      it.todo('is possible to remove accounts with the workspace')
    })
  })
})
