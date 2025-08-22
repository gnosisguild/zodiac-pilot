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
  callbackState?: string
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
    callbackState,
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
      callbackState,
    })
    .returning()

  return proposedTransaction
}
