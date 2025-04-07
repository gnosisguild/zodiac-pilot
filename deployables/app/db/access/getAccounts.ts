import type { DBClient } from '../dbClient'

type GetAccountsOptions = {
  tenantId: string
  userId?: string
}

export const getAccounts = (
  db: DBClient,
  { tenantId, userId }: GetAccountsOptions,
) =>
  db.query.account.findMany({
    where(fields, { eq, and }) {
      const where = eq(fields.tenantId, tenantId)

      if (userId != null) {
        return and(where, eq(fields.createdById, userId))
      }

      return where
    },
  })
