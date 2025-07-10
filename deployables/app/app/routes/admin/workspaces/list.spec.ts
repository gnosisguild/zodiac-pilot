import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  getAccount,
  getTenant,
  getWorkspace,
  getWorkspaces,
} from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe, waitForPendingActions } from '@zodiac/test-utils'
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

      await waitForPendingActions()

      await expect(
        getWorkspace(dbClient(), tenant.defaultWorkspaceId),
      ).resolves.toHaveProperty('label', 'Workspace updated')
    })

    it('is possible to set a workspace as the default one', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const workspace = await workspaceFactory.create(tenant, user, {
        label: 'New workspace',
      })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Workspace options',
          description: 'New workspace',
        }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))

      await userEvent.click(
        await screen.findByRole('checkbox', {
          name: 'Use as default workspace',
        }),
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getTenant(dbClient(), tenant.id)).resolves.toHaveProperty(
        'defaultWorkspaceId',
        workspace.id,
      )
    })

    it('shows when the workspace is already the default', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Workspace options',
        }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))

      expect(
        await screen.findByRole('checkbox', {
          name: 'Use as default workspace',
        }),
      ).toBeChecked()
    })
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

      await waitForPendingActions()

      await expect(
        getWorkspaces(dbClient(), { tenantId: tenant.id }),
      ).resolves.toEqual([
        expect.objectContaining(
          await getWorkspace(dbClient(), tenant.defaultWorkspaceId),
        ),
      ])
    })

    it('redirects to the default workspace when the current one was deleted', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const workspace = await workspaceFactory.create(tenant, user, {
        label: 'Test workspace',
      })

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: workspace.id,
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

      await expectRouteToBe(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    })
    it('is not possible to remove the default workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await render(
        href('/workspace/:workspaceId/admin/workspaces', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Workspace options',
        }),
      )

      expect(
        await screen.findByRole('button', { name: 'Remove' }),
      ).toBeDisabled()
    })

    describe('Accounts', () => {
      it('is possible to move accounts to a different workspace', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user, {
          defaultWorkspaceLabel: 'Default workspace',
        })

        const workspace = await workspaceFactory.create(tenant, user, {
          label: 'Workspace',
        })

        const account = await accountFactory.create(tenant, user, {
          workspaceId: workspace.id,
        })

        await render(
          href('/workspace/:workspaceId/admin/workspaces', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('button', {
            name: 'Workspace options',
            description: 'Workspace',
          }),
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Remove' }),
        )

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Move accounts to' }),
        )
        await userEvent.click(
          await screen.findByRole('option', { name: 'Default workspace' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Remove' }),
        )

        await waitForPendingActions()

        await expect(
          getAccount(dbClient(), account.id),
        ).resolves.toHaveProperty('workspaceId', tenant.defaultWorkspaceId)
      })
    })
  })
})
