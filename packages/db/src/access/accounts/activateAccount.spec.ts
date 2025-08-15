import {
  accountFactory,
  dbIt,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { and, eq } from 'drizzle-orm'
import { describe, expect } from 'vitest'
import { AccountTable, ActiveAccountTable } from '../../../schema'
import { dbClient } from '../../dbClient'
import { activateAccount } from './activateAccount'

describe('Activate account', () => {
  dbIt('makes sure only one account is active per tenant', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    const accountA = await accountFactory.create(tenant, user)
    const accountB = await accountFactory.create(tenant, user)

    await activateAccount(dbClient(), tenant, user, accountA.id)
    await activateAccount(dbClient(), tenant, user, accountB.id)

    const activatedAccounts = await dbClient()
      .select()
      .from(AccountTable)
      .innerJoin(
        ActiveAccountTable,
        and(
          eq(ActiveAccountTable.accountId, AccountTable.id),
          eq(ActiveAccountTable.userId, user.id),
        ),
      )
    const activeAccounts = activatedAccounts.map(({ Account }) => Account)

    expect(activeAccounts).toEqual([accountB])
  })
})
