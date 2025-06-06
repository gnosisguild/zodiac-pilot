import { invariant } from '@epic-web/invariant'
import { metaTransactionRequestSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getProposedTransaction = async (
  db: DBClient,
  proposalId: UUID,
) => {
  const proposal = await db.query.proposedTransactions.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, proposalId)
    },
  })

  invariant(
    proposal != null,
    `Could not find transaction proposal with id "${proposalId}"`,
  )

  return {
    ...proposal,
    transactions: metaTransactionRequestSchema
      .array()
      .parse(proposal.transaction),
  }
}
