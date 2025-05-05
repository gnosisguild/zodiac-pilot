import type { UUID } from 'crypto'
import type { DBClient } from '../dbClient'

type GetRoutesOptions = {
  walletId: UUID
  accountId: UUID
}

export const getRoutes = (
  db: DBClient,
  tenantId: UUID,
  { walletId, accountId }: GetRoutesOptions,
) =>
  db.query.route.findMany({
    where(fields, { eq, and }) {
      return and(
        eq(fields.tenantId, tenantId),
        eq(fields.fromId, walletId),
        eq(fields.toId, accountId),
      )
    },
  })
