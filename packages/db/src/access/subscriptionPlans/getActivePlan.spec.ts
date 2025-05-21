import { subscriptionPlanFactory, tenantFactory } from '@zodiac/db/test-utils'
import { describe, expect, it } from 'vitest'
import { dbClient } from '../../dbClient'
import { activatePlan } from './activatePlan'
import { getActivePlan } from './getActivePlan'

describe('getActivePlan', () => {
  it('retrieves the active plan for a tenant', async () => {
    const tenant = await tenantFactory.create()
    const plan = await subscriptionPlanFactory.create()

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: plan.id,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(plan)
  })
})
