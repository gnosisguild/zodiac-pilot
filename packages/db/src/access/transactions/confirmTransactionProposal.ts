import { ProposedTransactionTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type ConfirmTransactionProposalOptions = {
  proposalId: UUID
  signedTransactionId: UUID
}

export const confirmTransactionProposal = (
  db: DBClient,
  { proposalId, signedTransactionId }: ConfirmTransactionProposalOptions,
) =>
  db
    .update(ProposedTransactionTable)
    .set({ signedTransactionId })
    .where(eq(ProposedTransactionTable.id, proposalId))
