import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getDefaultSubscriptionPlan } from '@zodiac/db'
import {
  subscriptionPlanFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Subscription plans', () => {
  describe('List', () => {
    it('lists all plans in the system', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      await subscriptionPlanFactory.create({ name: 'Open' })

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'Open' }),
      ).toBeInTheDocument()
    })

    it('is possible to add a new plan', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(
        await screen.findByRole('link', { name: 'Add new plan' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Name' }),
        'New plan',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

      expect(
        await screen.findByRole('cell', { name: 'New plan' }),
      ).toBeInTheDocument()
    })
  })

  describe('Default plan', () => {
    it('shows the default plan', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      await subscriptionPlanFactory.create({ isDefault: true, name: 'Open' })

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'Open' }),
      ).toHaveAccessibleDescription('Default')
    })

    it('is possible to make a plan the default', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const plan = await subscriptionPlanFactory.create({ name: 'Open' })

      const { waitForPendingActions } = await render(
        href('/system-admin/subscriptionPlans'),
        {
          user,
          tenant,
          isSystemAdmin: true,
        },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Make default' }),
      )

      await waitForPendingActions()

      await expect(
        getDefaultSubscriptionPlan(dbClient()),
      ).resolves.toHaveProperty('id', plan.id)
    })
  })
})
