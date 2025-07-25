import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { dbIt, tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Tenants', () => {
  dbIt('lists all tenants', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    await tenantFactory.create(user, { name: 'Tenant A' })
    await tenantFactory.create(user, { name: 'Tenant B' })

    await render(href('/system-admin/tenants'), {
      user,
      tenant,
      isSystemAdmin: true,
    })

    expect(
      await screen.findByRole('link', { name: 'Tenant A' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Tenant B' }),
    ).toBeInTheDocument()
  })
})
