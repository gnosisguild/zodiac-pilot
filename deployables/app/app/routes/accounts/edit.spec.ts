import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getAccount } from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { queryInitiators, queryRoutes } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryInitiators: vi.fn(),
    queryRoutes: vi.fn(),
  }
})

const mockQueryInitiators = vi.mocked(queryInitiators)
const mockQueryRoutes = vi.mocked(queryRoutes)

describe('Edit account', () => {
  beforeEach(() => {
    mockQueryRoutes.mockResolvedValue([])
    mockQueryInitiators.mockResolvedValue([])
  })

  describe('Label', () => {
    it('displays the current label', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)
      const account = await accountFactory.create(tenant, user, {
        label: 'Test label',
      })

      await render(
        href('/workspace/:workspaceId/accounts/:accountId', {
          accountId: account.id,
          workspaceId: workspace.id,
        }),
        {
          tenant,
          user,
        },
      )

      expect(await screen.findByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test label',
      )
    })

    it('is possible to update the label', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)
      const account = await accountFactory.create(tenant, user, { label: '' })

      const { waitForPendingActions } = await render(
        href('/workspace/:workspaceId/accounts/:accountId', {
          accountId: account.id,
          workspaceId: workspace.id,
        }),
        { tenant, user },
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'New label',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getAccount(dbClient(), account.id)).resolves.toHaveProperty(
        'label',
        'New label',
      )
    })
  })
})
