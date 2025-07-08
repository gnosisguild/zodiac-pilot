import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
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
})
