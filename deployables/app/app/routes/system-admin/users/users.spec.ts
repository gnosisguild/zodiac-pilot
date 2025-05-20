import {
  createMockListResult,
  createMockWorkOsUser,
  render,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import { getWorkOS } from '@workos-inc/authkit-react-router'
import { tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

const mockListUsers = vi.mocked(getWorkOS().userManagement.listUsers)

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
  })
})
