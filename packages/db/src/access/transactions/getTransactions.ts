import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getTransactions = (db: DBClient, accountId: UUID) => {
  return db.query.signedTransaction.findMany({
    where(fields, { eq }) {
      return eq(fields.accountId, accountId)
    },
  })
}
