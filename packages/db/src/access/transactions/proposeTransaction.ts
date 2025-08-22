import { ProposedTransactionTable } from '@zodiac/db/schema'
import { safeJson, type MetaTransactionRequest } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ProposeTransactionOptions = {
  userId: UUID
  tenantId: UUID
  accountId: UUID
  workspaceId: UUID
  transaction: MetaTransactionRequest[]
  callbackUrl?: URL
}

export const proposeTransaction = async (
  db: DBClient,
  {
    userId,
    tenantId,
    accountId,
    transaction,
    workspaceId,
    callbackUrl,
  }: ProposeTransactionOptions,
) => {
  const [proposedTransaction] = await db
    .insert(ProposedTransactionTable)
    .values({
      tenantId,
      workspaceId,
      transaction: safeJson(transaction),
      userId,
      accountId,
      callbackUrl: callbackUrl?.toString(),
    })
    .returning()

  return proposedTransaction
}
