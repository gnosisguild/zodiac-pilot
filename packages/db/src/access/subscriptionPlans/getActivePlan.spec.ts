import {
  dbIt,
  subscriptionPlanFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { addDays, subDays } from 'date-fns'
import { describe, expect } from 'vitest'
import { dbClient } from '../../dbClient'
import { activatePlan } from './activatePlan'
import { getActivePlan } from './getActivePlan'

describe('getActivePlan', () => {
  dbIt('retrieves the active plan for a tenant', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const plan = await subscriptionPlanFactory.create()

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: plan.id,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(plan)
  })

  dbIt('retrieves only plans that are already valid', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
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

  dbIt('retrieves only plans that are still valid', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
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

  dbIt('retrieves the pan with the highest priority', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const planA = await subscriptionPlanFactory.create({ priority: 1 })
    const planB = await subscriptionPlanFactory.create({ priority: 2 })

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planA.id,
    })

    await activatePlan(dbClient(), {
      tenantId: tenant.id,
      subscriptionPlanId: planB.id,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(planB)
  })
})
