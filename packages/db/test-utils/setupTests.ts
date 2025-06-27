import { closeCurrentClient, dbClient } from '@zodiac/db'
import { sleepTillIdle } from '@zodiac/test-utils'
import { afterAll, beforeEach } from 'vitest'
import { deleteAllFeatures } from './deleteAllFeatures'
import { deleteAllSubscriptionPlans } from './deleteAllSubscriptionPlans'
import { deleteAllTenants } from './deleteAllTenants'
import { deleteAllUsers } from './deleteAllUsers'

beforeEach(async () => {
  const db = dbClient()

  await sleepTillIdle()

  await Promise.all([
    deleteAllTenants(db),
    deleteAllFeatures(db),
    deleteAllUsers(db),
    deleteAllSubscriptionPlans(db),
  ])
})

afterAll(async () => {
  await sleepTillIdle()

  await closeCurrentClient()
})
