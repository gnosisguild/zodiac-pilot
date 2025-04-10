import {
  WalletTable,
  type User,
  type Wallet,
  type WalletCreateInput,
} from '@zodiac/db'
import { randomAddress } from '@zodiac/test-utils'
import { createFactory } from './createFactory'

export const walletFactory = createFactory<
  WalletCreateInput,
  Wallet,
  [owner: User]
>({
  build(user, wallet) {
    return {
      address: randomAddress(),
      belongsToId: user.id,
      label: 'Test wallet',

      ...wallet,
    }
  },
  async create(db, data) {
    const [wallet] = await db.insert(WalletTable).values(data).returning()

    return wallet
  },
})
