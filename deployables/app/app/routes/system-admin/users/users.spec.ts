import {
  createMockListResult,
  createMockWorkOsUser,
  render,
} from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { dbIt, tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, vi } from 'vitest'

const mockListUsers = vi.mocked(getWorkOS().userManagement.listUsers)
const mockGetUser = vi.mocked(getWorkOS().userManagement.getUser)

describe('Users', () => {
  describe('System', () => {
    dbIt('lists all users', async () => {
      const user = await userFactory.create({ fullName: 'John Doe' })
      const tenant = await tenantFactory.create(user)

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
    dbIt('lists users', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

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

    dbIt(
      'does not show users that have a matching user in our system',
      async () => {
        const workOsUser = createMockWorkOsUser({
          firstName: 'John',
          lastName: 'Doe',
        })

        const user = await userFactory.create({
          externalId: workOsUser.id,
        })
        const tenant = await tenantFactory.create(user)

        mockListUsers.mockResolvedValue(createMockListResult([workOsUser]))

        await render(href('/system-admin/users'), {
          user,
          tenant,
          isSystemAdmin: true,
        })
        const { queryByRole } = within(
          await screen.findByRole('region', { name: 'WorkOS Users' }),
        )

        expect(
          queryByRole('cell', { name: 'John Doe' }),
        ).not.toBeInTheDocument()
      },
    )

    dbIt('is possible to remove a work os user', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const workOsUser = createMockWorkOsUser({
        firstName: 'John',
        lastName: 'Doe',

        externalId: 'does-not-exist',
      })

      mockListUsers.mockResolvedValue(createMockListResult([workOsUser]))
      mockGetUser.mockResolvedValue(workOsUser)

      await render(href('/system-admin/users'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

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
