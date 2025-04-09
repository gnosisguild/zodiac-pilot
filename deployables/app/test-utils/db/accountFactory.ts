import {
  AccountTable,
  type Account,
  type AccountCreateInput,
  type User,
} from '@/db'
import { Chain } from '@zodiac/chains'
import { randomAddress } from '@zodiac/test-utils'
import { createFactory } from './createFactory'

export const accountFactory = createFactory<
  AccountCreateInput,
  Account,
  [owner: User]
>({
  build(user, account) {
    return {
      address: randomAddress(),
      chainId: Chain.ETH,
      createdById: user.id,
      tenantId: user.tenantId,

      ...account,
    }
  },
  async create(db, data) {
    const [account] = await db.insert(AccountTable).values(data).returning()

    return account
  },
})
