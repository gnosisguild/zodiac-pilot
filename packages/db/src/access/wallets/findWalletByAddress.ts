import type { User } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../../dbClient'

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
