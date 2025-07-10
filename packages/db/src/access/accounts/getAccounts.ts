import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetAccountsOptions = {
  tenantId: UUID
  workspaceId?: UUID
  deleted?: boolean
}

export const getAccounts = (
  db: DBClient,
  { tenantId, workspaceId, deleted = false }: GetAccountsOptions,
) =>
  db.query.account.findMany({
    where(fields, { eq, and }) {
      let where = and(
        eq(fields.tenantId, tenantId),
        eq(fields.deleted, deleted),
      )

      if (workspaceId != null) {
        where = and(where, eq(fields.workspaceId, workspaceId))
      }

      return where
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
  })
