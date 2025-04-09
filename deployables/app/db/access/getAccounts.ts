import type { DBClient } from '../dbClient'

type GetAccountsOptions = {
  tenantId: string
  userId: string
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
    with: {
      activeRoutes: {
        where(fields, { eq }) {
          return eq(fields.userId, userId)
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
