import { render } from '@/test-utils'
import { dbClient, getProposedTransactions } from '@zodiac/db'
import {
  accountFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { encode } from '@zodiac/schema'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Sign', () => {
  it('creates a proposal and redirects the user', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)
    const account = await accountFactory.create(tenant, user)

    const transaction = createMockTransactionRequest()

    await render(
      href('/submit/account/:accountId/:transactions', {
        accountId: account.id,
        transactions: encode([transaction]),
      }),
      { user, tenant },
    )

    const [proposedTransaction] = await getProposedTransactions(
      dbClient(),
      user,
      account,
    )

    expect(proposedTransaction).toHaveProperty('transaction', [transaction])
  })
})
