import { ChainId } from '@zodiac/chains'
import { User } from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'

export const findDefaultWallet = async (
  db: DBClient,
  user: User,
  chainId: ChainId,
) => {
  const result = await db.query.defaultWallet.findFirst({
    where(fields, { eq, and }) {
      return and(eq(fields.userId, user.id), eq(fields.chainId, chainId))
    },
    with: { wallet: true },
  })

  if (result == null) {
    return null
  }

  return result.wallet
}
