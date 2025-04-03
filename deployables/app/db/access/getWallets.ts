import type { DBClient } from '../dbClient'

export const getWallets = (db: DBClient, userId: string) =>
  db.query.wallet.findMany({
    where(fields, { eq }) {
      return eq(fields.belongsToId, userId)
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
  })
