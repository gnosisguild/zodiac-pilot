import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetByTenant = {
  tenantId: UUID
}

type GetByWorkspace = {
  workspaceId: UUID
}

type GetAccountsOptions = (GetByTenant | GetByWorkspace) & {
  deleted?: boolean
}

export const getAccounts = (
  db: DBClient,
  { deleted = false, ...options }: GetAccountsOptions,
) =>
  db.query.account.findMany({
    where(fields, { eq, and }) {
      const where = eq(fields.deleted, deleted)

      if ('workspaceId' in options) {
        return and(where, eq(fields.workspaceId, options.workspaceId))
      }

      return and(where, eq(fields.tenantId, options.tenantId))
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
  })
