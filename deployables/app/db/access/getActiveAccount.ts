import type { DBClient } from '../dbClient'
import type { User } from '../schema'

export const getActiveAccount = async (db: DBClient, user: User) => {
  const result = await db.query.activeAccount.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.tenantId, user.tenantId), eq(fields.userId, user.id))
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
