import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetWalletsOptions = {
  deleted?: boolean
}

export const getWallets = (
  db: DBClient,
  userId: UUID,
  { deleted = false }: GetWalletsOptions = {},
) =>
  db.query.wallet.findMany({
    where(fields, { eq, and }) {
      return and(eq(fields.belongsToId, userId), eq(fields.deleted, deleted))
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
  })
