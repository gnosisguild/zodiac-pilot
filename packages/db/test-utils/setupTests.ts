import { dbClient } from '@zodiac/db'
import { beforeEach } from 'vitest'
import { deleteAllFeatures } from './deleteAllFeatures'
import { deleteAllTenants } from './deleteAllTenants'
import { deleteAllUsers } from './deleteAllUsers'

beforeEach(async () => {
  const db = dbClient()

  await Promise.all([
    deleteAllTenants(db),
    deleteAllFeatures(db),
    deleteAllUsers(db),
  ])
})
