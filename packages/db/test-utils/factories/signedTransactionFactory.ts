import { invariant } from '@epic-web/invariant'
import {
  SignedTransactionTable,
  type Account,
  type Route,
  type SignedTransaction,
  type SignedTransactionCreateInput,
  type User,
} from '@zodiac/db/schema'
import {
  createMockTransactionRequest,
  createMockWaypoints,
} from '@zodiac/modules/test-utils'
import { jsonStringify } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const signedTransactionFactory = createFactory<
  SignedTransactionCreateInput,
  SignedTransaction,
  [route: Route, user: User, account: Account]
>({
  build(route, user, account, data) {
    invariant(route.toId === account.id, 'Route does not lead to account')

    return {
      routeId: route.id,
      accountId: route.toId,
      walletId: route.fromId,
      tenantId: route.tenantId,
      workspaceId: account.id,
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
