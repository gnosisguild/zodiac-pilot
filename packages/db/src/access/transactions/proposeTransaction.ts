import { ProposedTransactionTable } from '@zodiac/db/schema'
import { jsonStringify, type MetaTransactionRequest } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ProposeTransactionOptions = {
  userId: UUID
  tenantId: UUID
  accountId: UUID
  transaction: MetaTransactionRequest[]
}

export const proposeTransaction = async (
  db: DBClient,
  { userId, tenantId, accountId, transaction }: ProposeTransactionOptions,
) => {
  const [proposedTransaction] = await db
    .insert(ProposedTransactionTable)
    .values({
      tenantId,
      transaction: JSON.parse(jsonStringify(transaction)),
      userId,
      accountId,
    })
    .returning()

  return proposedTransaction
}
