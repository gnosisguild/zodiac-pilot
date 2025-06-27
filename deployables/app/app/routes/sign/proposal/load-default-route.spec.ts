import { simulateTransactionBundle } from '@/simulation-server'
import { createMockExecuteTransactionAction, render } from '@/test-utils'
import { jsonRpcProvider } from '@/utils'
import { screen } from '@testing-library/react'
import { Chain } from '@zodiac/chains'
import { dbClient, setDefaultRoute } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  transactionProposalFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { expectRouteToBe, randomAddress } from '@zodiac/test-utils'
import { MockJsonRpcProvider } from '@zodiac/test-utils/rpc'
import { href } from 'react-router'
import { planExecution, queryRoutes } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccount, useConnectorClient } from 'wagmi'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    execute: vi.fn(),
    planExecution: vi.fn(),
    queryRoutes: vi.fn(),
    checkPermissions: vi.fn(),
  }
})

const mockPlanExecution = vi.mocked(planExecution)
const mockQueryRoutes = vi.mocked(queryRoutes)

vi.mock('wagmi', async (importOriginal) => {
  const module = await importOriginal<typeof import('wagmi')>()

  return {
    ...module,

    useAccount: vi.fn(module.useAccount),
    useConnectorClient: vi.fn(module.useConnectorClient),
  }
})

const mockUseAccount = vi.mocked(useAccount)
const mockUseConnectorClient = vi.mocked(useConnectorClient)

vi.mock('@/simulation-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/simulation-server')>()

  return {
    ...module,

    simulateTransactionBundle: vi.fn(),
  }
})

const mockSimulateTransactionBundle = vi.mocked(simulateTransactionBundle)

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,

    jsonRpcProvider: vi.fn(),
  }
})

const mockJsonRpcProvider = vi.mocked(jsonRpcProvider)

describe('Load default route', () => {
  beforeEach(() => {
    mockPlanExecution.mockResolvedValue([createMockExecuteTransactionAction()])
    mockQueryRoutes.mockResolvedValue([])

    mockJsonRpcProvider.mockReturnValue(new MockJsonRpcProvider())

    // @ts-expect-error We really only want to use this subset
    mockUseAccount.mockReturnValue({
      address: randomAddress(),
      chainId: Chain.ETH,
    })

    // @ts-expect-error We just need this to be there
    mockUseConnectorClient.mockReturnValue({ data: {} })

    mockSimulateTransactionBundle.mockResolvedValue({
      error: null,
      approvals: [],
      tokenFlows: { sent: [], received: [], other: [] },
    })
  })

  it('loads the default route for an account and redirects the user', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)

    const route = await routeFactory.create(account, wallet)

    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
    )

    await setDefaultRoute(dbClient(), tenant, user, route)

    await render(
      href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
      { tenant, user },
    )

    await expectRouteToBe(
      href('/submit/proposal/:proposalId/:routeId', {
        proposalId: proposal.id,
        routeId: route.id,
      }),
    )
  })

  it('picks the first route when no default route is set', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const wallet = await walletFactory.create(user)
    const account = await accountFactory.create(tenant, user)

    const routeA = await routeFactory.create(account, wallet, {
      label: 'Route A',
    })
    await routeFactory.create(account, wallet, { label: 'Route B' })

    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
    )

    await render(
      href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
      { tenant, user },
    )

    await expectRouteToBe(
      href('/submit/proposal/:proposalId/:routeId', {
        proposalId: proposal.id,
        routeId: routeA.id,
      }),
    )
  })

  it('shows an error when no route has been configured', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const account = await accountFactory.create(tenant, user)

    const proposal = await transactionProposalFactory.create(
      tenant,
      user,
      account,
    )

    await render(
      href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
      { tenant, user },
    )

    expect(
      await screen.findByRole('alert', {
        name: 'Incomplete account configuration',
      }),
    ).toHaveAccessibleDescription(
      'This transaction cannot be signed because the configuration for this account is incomplete.',
    )
  })
})
