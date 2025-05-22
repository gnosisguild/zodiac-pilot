import { subscriptionPlanFactory } from '@zodiac/db/test-utils'
import { randomUUID } from 'crypto'
import { describe, expect, it } from 'vitest'
import { dbClient } from '../../dbClient'
import { getActivePlan } from '../subscriptionPlans'
import { createTenant } from './createTenant'

describe('createTenant', () => {
  it('assigns the default subscription plan to new tenants', async () => {
    const plan = await subscriptionPlanFactory.create({ isDefault: true })

    const tenant = await createTenant(dbClient(), {
      name: 'Test tenant',
      externalId: randomUUID(),
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(plan)
  })
})
