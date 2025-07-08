import {
  accountFactory,
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import { describe, expect, it } from 'vitest'
import { dbClient } from '../../dbClient'
import { activateAccount } from './activateAccount'

describe('Activate account', () => {
  it('makes sure only one account is active per tenant', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const workspace = await workspaceFactory.create(tenant, user)

    const accountA = await accountFactory.create(tenant, user)
    const accountB = await accountFactory.create(tenant, user)

    await activateAccount(dbClient(), tenant, user, accountA.id)
    await activateAccount(dbClient(), tenant, user, accountB.id)

    const activatedAccounts = await dbClient().query.activeAccount.findMany({
      where(fields, { eq }) {
        return eq(fields.userId, user.id)
      },
      with: { account: true },
    })
    const activeAccounts = activatedAccounts.map(({ account }) => account)

    expect(activeAccounts).toEqual([accountB])
  })
})
