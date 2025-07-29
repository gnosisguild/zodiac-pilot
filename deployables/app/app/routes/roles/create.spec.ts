import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  addUserToTenant,
  dbClient,
  getActivatedAccounts,
  getRoleMembers,
  getRoles,
} from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Create role', () => {
  dbIt('is possible to create a new role', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    await render(
      href('/workspace/:workspaceId/roles/create', {
        workspaceId: tenant.defaultWorkspaceId,
      }),
      { tenant, user },
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Label' }),
      'New role',
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('cell', { name: 'New role' }),
    ).toBeInTheDocument()
  })

  dbIt('is possible to add members', async () => {
    const userA = await userFactory.create({ fullName: 'User A' })
    const userB = await userFactory.create({ fullName: 'User B' })
    const tenant = await tenantFactory.create(userA)

    await addUserToTenant(dbClient(), tenant, userB)

    await render(
      href('/workspace/:workspaceId/roles/create', {
        workspaceId: tenant.defaultWorkspaceId,
      }),
      { tenant, user: userA },
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Label' }),
      'New role',
    )

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Members' }),
    )
    await userEvent.click(
      await screen.findByRole('option', { name: userA.fullName }),
    )

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Members' }),
    )
    await userEvent.click(
      await screen.findByRole('option', { name: userB.fullName }),
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }))

    await waitForPendingActions()

    const [role] = await getRoles(dbClient(), {
      workspaceId: tenant.defaultWorkspaceId,
    })

    await expect(
      getRoleMembers(dbClient(), {
        workspaceId: role.workspaceId,
        roleId: role.id,
      }),
    ).resolves.toHaveProperty(role.id, [userA, userB])
  })

  dbIt('is possible to activate the role on multiple accounts', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const accountA = await accountFactory.create(tenant, user, {
      label: 'Account A',
    })
    const accountB = await accountFactory.create(tenant, user, {
      label: 'Account B',
    })

    await render(
      href('/workspace/:workspaceId/roles/create', {
        workspaceId: tenant.defaultWorkspaceId,
      }),
      { tenant, user },
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Label' }),
      'New role',
    )

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Accounts' }),
    )
    await userEvent.click(
      await screen.findByRole('option', { name: 'Account A' }),
    )

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Accounts' }),
    )
    await userEvent.click(
      await screen.findByRole('option', { name: 'Account B' }),
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }))

    await waitForPendingActions()

    const [role] = await getRoles(dbClient(), {
      workspaceId: tenant.defaultWorkspaceId,
    })

    await expect(
      getActivatedAccounts(dbClient(), {
        workspaceId: role.workspaceId,
        roleId: role.id,
      }),
    ).resolves.toHaveProperty(role.id, [accountA, accountB])
  })
})
