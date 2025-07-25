import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  activateFeatures,
  activatePlan,
  dbClient,
  getActiveFeatures,
  getActivePlan,
} from '@zodiac/db'
import {
  dbIt,
  featureFactory,
  subscriptionPlanFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Tenant', () => {
  describe('Features', () => {
    dbIt('is possible to activate a feature', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const feature = await featureFactory.create({ name: 'Test feature' })

      await render(
        href('/system-admin/tenant/:tenantId', { tenantId: tenant.id }),
        { user, tenant, isSystemAdmin: true },
      )

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Test feature' }),
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save features' }),
      )

      await waitForPendingActions()

      await expect(getActiveFeatures(dbClient(), tenant.id)).resolves.toEqual([
        feature,
      ])
    })

    dbIt('is possible to deactivate a feature', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const feature = await featureFactory.create({ name: 'Test feature' })

      await activateFeatures(dbClient(), {
        tenantId: tenant.id,
        featureIds: [feature.id],
      })

      await render(
        href('/system-admin/tenant/:tenantId', { tenantId: tenant.id }),
        { user, tenant, isSystemAdmin: true },
      )

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Test feature' }),
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save features' }),
      )

      await waitForPendingActions()

      await expect(getActiveFeatures(dbClient(), tenant.id)).resolves.toEqual(
        [],
      )
    })

    dbIt('is possible to activate additional features', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const featureA = await featureFactory.create()
      const featureB = await featureFactory.create({ name: 'Test feature' })

      await activateFeatures(dbClient(), {
        tenantId: tenant.id,
        featureIds: [featureA.id],
      })

      await render(
        href('/system-admin/tenant/:tenantId', { tenantId: tenant.id }),
        { user, tenant, isSystemAdmin: true },
      )

      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Test feature' }),
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save features' }),
      )

      await waitForPendingActions()

      await expect(getActiveFeatures(dbClient(), tenant.id)).resolves.toEqual([
        featureA,
        featureB,
      ])
    })
  })

  describe('Plans', () => {
    dbIt('is possible to assign a plan to a tenant', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const plan = await subscriptionPlanFactory.create()

      await render(
        href('/system-admin/tenant/:tenantId', { tenantId: tenant.id }),
        { tenant, user, isSystemAdmin: true },
      )

      await userEvent.click(
        await screen.findByRole('link', { name: 'Add plan' }),
      )
      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Plan' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: plan.name }),
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

      await waitForPendingActions()

      await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(plan)
    })

    dbIt('shows the plans that are assigned to a tenant', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const plan = await subscriptionPlanFactory.create({ name: 'Open' })

      await activatePlan(dbClient(), {
        tenantId: tenant.id,
        subscriptionPlanId: plan.id,
      })

      await render(
        href('/system-admin/tenant/:tenantId', { tenantId: tenant.id }),
        { tenant, user, isSystemAdmin: true },
      )

      expect(
        await screen.findByRole('cell', { name: 'Open' }),
      ).toBeInTheDocument()
    })
  })
})
