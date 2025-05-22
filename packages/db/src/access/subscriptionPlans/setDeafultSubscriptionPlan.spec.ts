import { subscriptionPlanFactory } from '@zodiac/db/test-utils'
import { describe, expect, it } from 'vitest'
import { dbClient } from '../../dbClient'
import { getSubscriptionPlan } from './getSubscriptionPlan'
import { setDefaultSubscriptionPlan } from './setDefaultSubscriptionPlan'

describe('setDefaultSubscriptionPlan', () => {
  it('allows only one default plan', async () => {
    const planA = await subscriptionPlanFactory.create()
    const planB = await subscriptionPlanFactory.create()

    await setDefaultSubscriptionPlan(dbClient(), planA.id)
    await setDefaultSubscriptionPlan(dbClient(), planB.id)

    await expect(
      getSubscriptionPlan(dbClient(), planA.id),
    ).resolves.toHaveProperty('isDefault', false)
  })
})
