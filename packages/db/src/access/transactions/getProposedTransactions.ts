import type { Account, User } from '@zodiac/db/schema'
import { metaTransactionRequestSchema } from '@zodiac/schema'
import type { DBClient } from '../../dbClient'

export const getProposedTransactions = async (
  db: DBClient,
  user: User,
  account: Account,
) => {
  const proposedTransactions = await db.query.proposedTransactions.findMany({
    where(fields, { and, eq }) {
      return and(eq(fields.accountId, account.id), eq(fields.userId, user.id))
    },
  })

  return proposedTransactions.map((proposedTransaction) => ({
    ...proposedTransaction,

    transaction: metaTransactionRequestSchema
      .array()
      .parse(proposedTransaction.transaction),
  }))
}
