import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import type { User } from '../schema'

export const findWalletByAddress = async (
  db: DBClient,
  user: User,
  address: HexAddress,
) =>
  db.query.wallet.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.belongsToId, user.id),
        eq(fields.address, address),
        eq(fields.deleted, false),
      )
    },
  })
