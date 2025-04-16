import { invariant } from '@epic-web/invariant'
import type { Tenant, User } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'
import { findActiveAccount } from './findActiveAccount'

export const getActiveAccount = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
) => {
  const account = await findActiveAccount(db, tenant, user)

  invariant(account != null, 'No active account found')

  return account
}
