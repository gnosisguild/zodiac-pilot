import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../dbClient'

export const getWallet = async (db: DBClient, walletId: UUID) => {
  const wallet = await db.query.wallet.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, walletId)
    },
  })

  invariant(wallet != null, `Could not find wallet with id "${walletId}"`)

  return wallet
}
