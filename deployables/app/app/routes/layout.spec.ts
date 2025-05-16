import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Layout', () => {
  describe('Admin link', () => {
    it('offers a link to the admin panel', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      process.env.ADMIN_ORG_ID = 'test-org'

      await render(href('/'), {
        user,
        tenant,
        workOsOrganization: { id: 'test-org' },
      })

      expect(
        await screen.findByRole('link', { name: 'System admin' }),
      ).toBeInTheDocument()
    })

    it('does not show the link in non-admin orgs', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      process.env.ADMIN_ORG_ID = 'test-org'

      await render(href('/'), {
        user,
        tenant,
        workOsOrganization: { id: 'another-org' },
      })

      expect(
        screen.queryByRole('link', { name: 'System admin' }),
      ).not.toBeInTheDocument()
    })
  })
})
