import {
  dbIt,
  subscriptionPlanFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { randomUUID } from 'crypto'
import { describe, expect } from 'vitest'
import { dbClient } from '../../dbClient'
import { getActivePlan } from '../subscriptionPlans'
import { getWorkspaces } from '../workspaces'
import { createTenant } from './createTenant'

describe('createTenant', () => {
  dbIt('assigns the default subscription plan to new tenants', async () => {
    const user = await userFactory.create()
    const plan = await subscriptionPlanFactory.create({ isDefault: true })

    const tenant = await createTenant(dbClient(), {
      name: 'Test tenant',
      externalId: randomUUID(),
      createdBy: user,
    })

    await expect(getActivePlan(dbClient(), tenant.id)).resolves.toEqual(plan)
  })

  dbIt('creates a default workspace', async () => {
    const user = await userFactory.create()

    await subscriptionPlanFactory.create({ isDefault: true })

    const tenant = await createTenant(dbClient(), {
      name: 'Test tenant',
      externalId: randomUUID(),
      createdBy: user,
    })

    await expect(
      getWorkspaces(dbClient(), { tenantId: tenant.id }),
    ).resolves.toMatchObject([
      { tenantId: tenant.id, createdById: user.id, label: 'Default workspace' },
    ])
  })
})
