import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  getActivatedAccounts,
  getRole,
  getRoleActionAssets,
  getRoleActions,
  getRoleMembers,
  setActiveAccounts,
  setRoleMembers,
} from '@zodiac/db'
import { RoleActionType } from '@zodiac/db/schema'
import {
  accountFactory,
  dbIt,
  roleActionFactory,
  roleFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Edit role', () => {
  dbIt('is possible to update the label', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const role = await roleFactory.create(tenant, user, { label: 'Test role' })

    await render(
      href('/workspace/:workspaceId/roles/:roleId', {
        workspaceId: tenant.defaultWorkspaceId,
        roleId: role.id,
      }),
      { tenant, user },
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Label' }),
      ' updated',
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitForPendingActions()

    await expect(getRole(dbClient(), role.id)).resolves.toHaveProperty(
      'label',
      'Test role updated',
    )
  })

  describe('Members', () => {
    dbIt('is possible to add members', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Members' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: user.fullName }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getRoleMembers(dbClient(), { roleId: role.id }),
      ).resolves.toHaveProperty(role.id, [user])
    })

    dbIt('is possible to remove members', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await setRoleMembers(dbClient(), role, [user.id])

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getRoleMembers(dbClient(), { roleId: role.id }),
      ).resolves.not.toHaveProperty(role.id)
    })
  })

  describe('Accounts', () => {
    dbIt('is possible to add an account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const account = await accountFactory.create(tenant, user, {
        label: 'Test account',
      })

      const role = await roleFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Accounts' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Test account' }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getActivatedAccounts(dbClient(), { roleId: role.id }),
      ).resolves.toHaveProperty(role.id, [account])
    })

    dbIt('is possible to remove an accounts from a role', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const account = await accountFactory.create(tenant, user, {
        label: 'Test account',
      })

      const role = await roleFactory.create(tenant, user)

      await setActiveAccounts(dbClient(), role, [account.id])

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getActivatedAccounts(dbClient(), { roleId: role.id }),
      ).resolves.not.toHaveProperty(role.id)
    })
  })

  describe('Role actions', async () => {
    dbIt('is possible to add a new action', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('link', { name: 'Add new action' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Action label' }),
        'Test action',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

      await waitForPendingActions()

      const [action] = await getRoleActions(dbClient(), role.id)

      expect(action).toMatchObject({
        label: 'Test action',
        type: RoleActionType.Swapper,
      })
    })

    dbIt('lists all current actions', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await roleActionFactory.create(role, user, { label: 'Test action' })

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('region', { name: 'Test action' }),
      ).toBeInTheDocument()
    })

    dbIt('is possible to edit an action', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await roleActionFactory.create(role, user, { label: 'Test action' })

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('link', { name: 'Edit action' }),
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Action label' }),
        ' updated',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      expect(
        await screen.findByRole('region', { name: 'Test action updated' }),
      ).toBeInTheDocument()
    })

    describe('Assets', () => {
      dbIt('is possible to add an asset', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)
        const action = await roleActionFactory.create(role, user)

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Add assets' }),
        )

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Assets' }),
        )
        await userEvent.click(
          await screen.findByRole('option', { name: 'WETH' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Add' }),
        )

        await waitForPendingActions()

        const [asset] = await getRoleActionAssets(dbClient(), action.id)

        expect(asset).toMatchObject({ roleActionId: action.id, symbol: 'WETH' })
      })
    })
  })
})
