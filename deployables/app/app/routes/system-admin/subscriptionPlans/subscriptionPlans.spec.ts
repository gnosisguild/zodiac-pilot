import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import {
  subscriptionPlanFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Subscription plans', () => {
  it('lists all plans in the system', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    await subscriptionPlanFactory.create({ name: 'Open' })

    await render(href('/system-admin/subscriptionPlan'), {
      user,
      tenant,
      isSystemAdmin: true,
    })

    expect(
      await screen.findByRole('cell', { name: 'Open' }),
    ).toBeInTheDocument()
  })
})
