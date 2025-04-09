import {
  WalletTable,
  type Tenant,
  type User,
  type Wallet,
  type WalletCreateInput,
} from '@/db'
import { randomAddress } from '@zodiac/test-utils'
import { createFactory } from './createFactory'

export const walletFactory = createFactory<
  WalletCreateInput,
  Wallet,
  [tenant: Tenant, owner: User]
>({
  build(tenant, user, wallet) {
    return {
      address: randomAddress(),
      belongsToId: user.id,
      label: 'Test wallet',
      tenantId: tenant.id,

      ...wallet,
    }
  },
  async create(db, data) {
    const [wallet] = await db.insert(WalletTable).values(data).returning()

    return wallet
  },
})
