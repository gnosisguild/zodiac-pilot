import { closeCurrentClient, dbClient } from '@zodiac/db'
import { afterAll, beforeEach } from 'vitest'
import { deleteAllFeatures } from './deleteAllFeatures'
import { deleteAllSubscriptionPlans } from './deleteAllSubscriptionPlans'
import { deleteAllTenants } from './deleteAllTenants'
import { deleteAllUsers } from './deleteAllUsers'

beforeEach(async () => {
  const db = dbClient()

  await Promise.all([
    deleteAllTenants(db),
    deleteAllFeatures(db),
    deleteAllUsers(db),
    deleteAllSubscriptionPlans(db),
  ])
})

afterAll(() => closeCurrentClient())
