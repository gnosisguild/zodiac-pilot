import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getLastAccountsUpdateTime = async (
  db: DBClient,
  tenantId: UUID,
) => {
  const lastUpdatedAccount = await db.query.account.findFirst({
    where(fields, { eq, and, isNotNull }) {
      return and(
        eq(fields.tenantId, tenantId),
        isNotNull(fields.updatedAt),
        eq(fields.deleted, false),
      )
    },
    orderBy(fields, { desc }) {
      return desc(fields.updatedAt)
    },
  })

  if (lastUpdatedAccount == null) {
    return null
  }

  return lastUpdatedAccount.updatedAt
}
