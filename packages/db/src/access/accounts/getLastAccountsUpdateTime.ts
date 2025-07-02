import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getLastAccountsUpdateTime = async (
  db: DBClient,
  tenantId: UUID,
) => {
  const lastUpdatedAccount = await db.query.account.findFirst({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
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
