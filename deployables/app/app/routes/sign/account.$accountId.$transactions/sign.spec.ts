import { simulateTransactionBundle } from '@/simulation-server'
import { createMockExecuteTransactionAction, render } from '@/test-utils'
import { activateRoute, dbClient, getProposedTransactions } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { encode } from '@zodiac/schema'
import {
  createMockTransactionRequest,
  expectRouteToBe,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { planExecution, queryRoutes } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planExecution: vi.fn(),
    queryRoutes: vi.fn(),
    checkPermissions: vi.fn(),
  }
})

const mockPlanExecution = vi.mocked(planExecution)
const mockQueryRoutes = vi.mocked(queryRoutes)

vi.mock('@/simulation-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/simulation-server')>()

  return {
    ...module,

    simulateTransactionBundle: vi.fn(),
  }
})

const mockSimulateTransactionBundle = vi.mocked(simulateTransactionBundle)

describe('Sign', () => {
  beforeEach(() => {
    mockQueryRoutes.mockResolvedValue([])
    mockPlanExecution.mockResolvedValue([createMockExecuteTransactionAction()])

    mockSimulateTransactionBundle.mockResolvedValue({
      error: null,
      approvals: [],
      tokenFlows: { sent: [], received: [], other: [] },
    })
  })

  it('creates a proposal', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)
    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)
    const route = await routeFactory.create(account, wallet)

    await activateRoute(dbClient(), tenant, user, route)

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

  it('redirects the user', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)
    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)
    const route = await routeFactory.create(account, wallet)

    await activateRoute(dbClient(), tenant, user, route)

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

    await expectRouteToBe(
      href('/submit/proposal/:proposalId', {
        proposalId: proposedTransaction.id,
      }),
    )
  })
})
