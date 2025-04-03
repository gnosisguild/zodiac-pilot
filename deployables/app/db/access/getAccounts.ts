import type { DBClient } from '../dbClient'

type GetAccountsOptions = {
  tenantId: string
}

export const getAccounts = (db: DBClient, { tenantId }: GetAccountsOptions) =>
  db.query.account.findMany({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
    },
  })
