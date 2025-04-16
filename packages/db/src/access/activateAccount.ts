import { ActiveAccountTable, type Tenant, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../dbClient'
import { removeActiveAccount } from './removeActiveAccount'

export const activateAccount = (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: UUID,
) =>
  db.transaction(async (tx) => {
    await removeActiveAccount(tx, tenant, user)

    await tx
      .insert(ActiveAccountTable)
      .values({ accountId, tenantId: tenant.id, userId: user.id })
  })
