import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import {
  featureFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Features', () => {
  describe('List', () => {
    it('lists all features', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      await featureFactory.create({ name: 'Test feature' })

      await render(href('/system-admin/features'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'Test feature' }),
      ).toBeInTheDocument()
    })
  })
})
