import { getAvailableChains } from '@/balances-server'
import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getAccount, getAccounts } from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe, waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAvailableChains = vi.mocked(getAvailableChains)

describe.sequential('List Accounts', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue([])
  })

  describe('List', () => {
    it('lists all accounts', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await accountFactory.create(tenant, user, {
        label: 'Test account',
      })

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('cell', { name: 'Test account' }),
      ).toBeInTheDocument()
    })

    it('lists only accounts from the selected workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)

      await accountFactory.create(tenant, user, {
        label: 'Workspace A',
        workspaceId: tenant.defaultWorkspaceId,
      })
      await accountFactory.create(tenant, user, {
        label: 'Workspace B',
        workspaceId: workspace.id,
      })

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: workspace.id,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('cell', { name: 'Workspace B' }),
      ).toBeInTheDocument()

      expect(
        screen.queryByRole('cell', { name: 'Workspace A' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Edit', () => {
    it('is possible to edit an account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const account = await accountFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        {
          tenant,
          user,
        },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))

      await expectRouteToBe(
        href('/workspace/:workspaceId/accounts/:accountId/no-routes', {
          workspaceId: tenant.defaultWorkspaceId,
          accountId: account.id,
        }),
      )
    })
  })

  describe('Remove', () => {
    it('is possible to remove an account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const account = await accountFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        {
          tenant,
          user,
        },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Delete' }))

      await userEvent.click(
        await screen.findByRole('button', { name: 'Delete' }),
      )

      await waitForPendingActions()

      const [deletedAccount] = await getAccounts(dbClient(), {
        tenantId: tenant.id,
        deleted: true,
      })

      expect(deletedAccount).toMatchObject({
        id: account.id,

        deleted: true,
        deletedById: user.id,
      })
    })
  })

  describe('Move', () => {
    it('is possible to move an account to a different workspace', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const workspace = await workspaceFactory.create(tenant, user, {
        label: 'Another workspace',
      })

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )
      await userEvent.click(await screen.findByRole('link', { name: 'Move' }))

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Target workspace' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Another workspace' }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Move' }))

      await waitForPendingActions()

      await expect(getAccount(dbClient(), account.id)).resolves.toHaveProperty(
        'workspaceId',
        workspace.id,
      )
    })

    it('is not possible to move accounts when there are no other workspaces', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      await accountFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )

      expect(await screen.findByRole('button', { name: 'Move' })).toBeDisabled()
    })
  })
})
