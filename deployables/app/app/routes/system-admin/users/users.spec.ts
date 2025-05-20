import {
  createMockListResult,
  createMockWorkOsUser,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

const mockListUsers = vi.mocked(getWorkOS().userManagement.listUsers)
const mockGetUser = vi.mocked(getWorkOS().userManagement.getUser)

describe('Users', () => {
  describe('System', () => {
    it('lists all users', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant, { fullName: 'John Doe' })

      await render(href('/system-admin/users'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'John Doe' }),
      ).toBeInTheDocument()
    })
  })

  describe('Work OS', () => {
    it('lists users', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const workOsUser = createMockWorkOsUser({
        firstName: 'John',
        lastName: 'Doe',
      })

      mockListUsers.mockResolvedValue(createMockListResult([workOsUser]))

      await render(href('/system-admin/users'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'John Doe' }),
      ).toBeInTheDocument()
    })

    it('does not show users that have a matching user in our system', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const workOsUser = createMockWorkOsUser({
        firstName: 'John',
        lastName: 'Doe',

        externalId: user.id,
      })

      mockListUsers.mockResolvedValue(createMockListResult([workOsUser]))

      await render(href('/system-admin/users'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        screen.queryByRole('cell', { name: 'John Doe' }),
      ).not.toBeInTheDocument()
    })

    it('is possible to remove a work os user', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const workOsUser = createMockWorkOsUser({
        firstName: 'John',
        lastName: 'Doe',

        externalId: 'does-not-exist',
      })

      mockListUsers.mockResolvedValue(createMockListResult([workOsUser]))
      mockGetUser.mockResolvedValue(workOsUser)

      const { waitForPendingActions } = await render(
        href('/system-admin/users'),
        {
          user,
          tenant,
          isSystemAdmin: true,
        },
      )

      await userEvent.click(await screen.findByRole('link', { name: 'Remove' }))
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Confirmation' }),
        'DELETE USER',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )

      await waitForPendingActions()

      expect(getWorkOS().userManagement.deleteUser).toHaveBeenCalledWith(
        workOsUser.id,
      )
    })
  })
})
