import { Chain, ChainId } from '@zodiac/chains'
import { Wallet } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getDefaultWallets = async (db: DBClient, userId: UUID) => {
  const result = await db.query.defaultWallet.findMany({
    where(fields, { eq }) {
      return eq(fields.userId, userId)
    },
    with: { wallet: true },
  })

  return result.reduce<Record<ChainId, Wallet | null>>(
    (result, entry) => ({ ...result, [entry.chainId]: entry.wallet }),
    {
      [Chain.ETH]: null,
      [Chain.ARB1]: null,
      [Chain.AVAX]: null,
      [Chain.BASE]: null,
      [Chain.BASESEP]: null,
      [Chain.BOB]: null,
      [Chain.CELO]: null,
      [Chain.GNO]: null,
      [Chain.HEMI]: null,
      [Chain.INK]: null,
      [Chain.KATANA]: null,
      [Chain.LINEA]: null,
      [Chain.MANTLE]: null,
      [Chain.MATIC]: null,
      [Chain.OETH]: null,
      [Chain.SEP]: null,
      [Chain.SONIC]: null,
      [Chain.BERACHAIN]: null,
      [Chain.UNICHAIN]: null,
      [Chain.WORLDCHAIN]: null,
      [Chain.ZKEVM]: null,
    },
  )
}
