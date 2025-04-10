import type { DBClient } from '../dbClient'
import type { Tenant, User } from '../schema'

export const getActiveAccount = async (
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
