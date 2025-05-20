import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { activateFeatures, dbClient, getActiveFeatures } from '@zodiac/db'
import {
  featureFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Tenant', () => {
  describe('Features', () => {
    it('is possible to activate a feature', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const feature = await featureFactory.create({ name: 'Test feature' })

      const { waitForPendingActions } = await render(
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

    it('is possible to deactivate a feature', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const feature = await featureFactory.create({ name: 'Test feature' })

      await activateFeatures(dbClient(), {
        tenantId: tenant.id,
        featureIds: [feature.id],
      })

      const { waitForPendingActions } = await render(
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

    it('is possible to activate additional features', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const featureA = await featureFactory.create()
      const featureB = await featureFactory.create({ name: 'Test feature' })

      await activateFeatures(dbClient(), {
        tenantId: tenant.id,
        featureIds: [featureA.id],
      })

      const { waitForPendingActions } = await render(
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
})
