import type { Tenant, User } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'

export const findActiveAccount = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
) => {
  const result = await db.query.activeAccount.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.tenantId, tenant.id), eq(fields.userId, user.id))
    },
    with: {
      account: true,
    },
  })

  if (result == null) {
    return null
  }

  return result.account
}
