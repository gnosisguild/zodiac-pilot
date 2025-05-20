import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Users', () => {
  it('lists all users from our system', async () => {
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
