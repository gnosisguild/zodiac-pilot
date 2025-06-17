import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getSignedTransaction = async (
  db: DBClient,
  signedTransactionId: UUID,
) => {
  const signedTransaction = await db.query.signedTransaction.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, signedTransactionId)
    },
    with: {
      signer: true,
    },
  })

  invariant(
    signedTransaction != null,
    `Could not find signed transaction with id "${signedTransactionId}"`,
  )

  return signedTransaction
}
