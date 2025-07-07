import {
  ProposedTransactionTable,
  type Account,
  type ProposedTransaction,
  type ProposedTransactionCreateInput,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import { createMockTransactionRequest } from '@zodiac/modules/test-utils'
import { jsonStringify } from '@zodiac/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const transactionProposalFactory = createFactory<
  ProposedTransactionCreateInput,
  ProposedTransaction,
  [tenant: Tenant, user: User, account: Account]
>({
  build(tenant, user, account, data) {
    return {
      accountId: account.id,
      tenantId: tenant.id,
      userId: user.id,

      transaction: [createMockTransactionRequest()],

      ...data,
    }
  },

  async create(db, { transaction, ...data }) {
    const [proposal] = await db
      .insert(ProposedTransactionTable)
      .values({
        ...data,

        transaction: JSON.parse(jsonStringify(transaction)),
      })
      .returning()

    return proposal
  },

  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      signedTransactionId: null,

      ...data,
    }
  },
})
