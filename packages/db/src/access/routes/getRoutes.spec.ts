import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { describe, expect, it } from 'vitest'
import { dbClient } from '../../dbClient'
import { getRoutes } from './getRoutes'

describe('getRoutes', () => {
  it('is possible to query all routes for a single user', async () => {
    const userA = await userFactory.create()
    const userB = await userFactory.create()

    const tenant = await tenantFactory.create([userA, userB])
    const workspace = await workspaceFactory.create(tenant, userA)

    const walletA = await walletFactory.create(userA)
    const walletB = await walletFactory.create(userB)

    const account = await accountFactory.create(tenant, userA, workspace)

    await routeFactory.create(account, walletA)

    const routeB = await routeFactory.create(account, walletB)

    await expect(
      getRoutes(dbClient(), tenant.id, {
        accountId: account.id,
        userId: userB.id,
      }),
    ).resolves.toEqual([{ ...routeB, wallet: walletB }])
  })
})
