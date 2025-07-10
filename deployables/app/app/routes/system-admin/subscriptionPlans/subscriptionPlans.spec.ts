import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  getDefaultSubscriptionPlan,
  getSubscriptionPlan,
} from '@zodiac/db'
import {
  subscriptionPlanFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Subscription plans', () => {
  describe('List', () => {
    it('lists all plans in the system', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

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
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

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
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

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
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const plan = await subscriptionPlanFactory.create({ name: 'Open' })

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Make default' }),
      )

      await waitForPendingActions()

      await expect(
        getDefaultSubscriptionPlan(dbClient()),
      ).resolves.toHaveProperty('id', plan.id)
    })
  })

  describe('Priority', () => {
    it('is possible to increase the priority of a plan', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const plan = await subscriptionPlanFactory.create({ priority: 1 })

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Increase priority' }),
      )

      await waitForPendingActions()

      await expect(
        getSubscriptionPlan(dbClient(), plan.id),
      ).resolves.toHaveProperty('priority', 2)
    })

    it('is possible to decrease the priority of a plan', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const plan = await subscriptionPlanFactory.create({ priority: 2 })

      await render(href('/system-admin/subscriptionPlans'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Decrease priority' }),
      )

      await waitForPendingActions()

      await expect(
        getSubscriptionPlan(dbClient(), plan.id),
      ).resolves.toHaveProperty('priority', 1)
    })
  })
})
