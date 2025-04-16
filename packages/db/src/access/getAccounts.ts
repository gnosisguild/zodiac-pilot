import type { UUID } from 'crypto'
import type { DBClient } from '../dbClient'

type GetAccountsOptions = {
  tenantId: UUID
  userId: UUID
  deleted?: boolean
}

export const getAccounts = (
  db: DBClient,
  { tenantId, userId, deleted = false }: GetAccountsOptions,
) =>
  db.query.account.findMany({
    where(fields, { eq, and }) {
      const where = and(
        eq(fields.tenantId, tenantId),
        eq(fields.deleted, deleted),
      )

      return where
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
    with: {
      activeRoutes: {
        where(fields, { eq, and }) {
          return and(eq(fields.userId, userId), eq(fields.tenantId, tenantId))
        },

        with: {
          route: {
            with: {
              wallet: true,
            },
          },
        },
      },
    },
  })
