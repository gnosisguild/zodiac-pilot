import { invariant } from '@epic-web/invariant'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import type { User } from '../schema'

export const getWalletByAddress = async (
  db: DBClient,
  user: User,
  address: HexAddress,
) => {
  const wallet = await db.query.wallet.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.belongsToId, user.id),
        eq(fields.address, address),
        eq(fields.deleted, false),
      )
    },
  })

  invariant(
    wallet != null,
    `User with id "${user.id}" does not own a wallet with address "${address}"`,
  )

  return wallet
}
