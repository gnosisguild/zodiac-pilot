import { subscriptionPlanFactory, tenantFactory } from '@zodiac/db/test-utils'
import { addDays, subDays } from 'date-fns'
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

  it('retrieves only plans that are already valid', async () => {
    const tenant = await tenantFactory.create()
    const planA = await subscriptionPlanFactory.create()
    const planB = await subscriptionPlanFactory.create()

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planA.id,
      validFrom: addDays(new Date(), 1),
    })

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planB.id,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(planB)
  })

  it('retrieves only plans that are still valid', async () => {
    const tenant = await tenantFactory.create()
    const planA = await subscriptionPlanFactory.create()
    const planB = await subscriptionPlanFactory.create()

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planA.id,
      validThrough: subDays(new Date(), 1),
    })

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planB.id,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(planB)
  })
})
