import { faker } from '@faker-js/faker'
import {
  WalletTable,
  type User,
  type Wallet,
  type WalletCreateInput,
} from '@zodiac/db/schema'
import { randomAddress } from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
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
      label: faker.company.buzzPhrase(),

      ...wallet,
    }
  },
  async create(db, data) {
    const [wallet] = await db.insert(WalletTable).values(data).returning()

    return wallet
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      deleted: false,
      deletedById: null,
      deletedAt: null,
      updatedAt: null,

      ...data,
    }
  },
})
