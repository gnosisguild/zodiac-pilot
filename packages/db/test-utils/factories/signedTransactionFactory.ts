import {
  SignedTransactionTable,
  type Route,
  type SignedTransaction,
  type SignedTransactionCreateInput,
  type User,
} from '@zodiac/db/schema'
import { jsonStringify } from '@zodiac/schema'
import {
  createMockTransactionRequest,
  createMockWaypoints,
} from '@zodiac/test-utils'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const signedTransactionFactory = createFactory<
  SignedTransactionCreateInput,
  SignedTransaction,
  [route: Route, user: User]
>({
  build(route, user, data) {
    return {
      routeId: route.id,
      accountId: route.toId,
      walletId: route.fromId,
      tenantId: route.tenantId,
      userId: user.id,
      waypoints: createMockWaypoints(),

      transaction: JSON.parse(jsonStringify([createMockTransactionRequest()])),

      ...data,
    }
  },

  async create(db, data) {
    const [signedTransaction] = await db
      .insert(SignedTransactionTable)
      .values(data)
      .returning()

    return signedTransaction
  },

  createWithoutDb(data) {
    return {
      createdAt: new Date(),
      explorerUrl: null,
      safeWalletUrl: null,
      id: randomUUID(),
      routeLabel: null,

      ...data,
    }
  },
})
