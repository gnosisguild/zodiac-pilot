import { simulateTransactionBundle } from '@/simulation-server'
import {
  createMockExecuteTransactionAction,
  createMockProposeTransactionAction,
  render,
} from '@/test-utils'
import { jsonRpcProvider } from '@/utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, EXPLORER_URL } from '@zodiac/chains'
import {
  dbClient,
  getProposedTransaction,
  getTransactions,
  setDefaultRoute,
  toExecutionRoute,
} from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  signedTransactionFactory,
  tenantFactory,
  transactionProposalFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { multisigTransactionUrl } from '@zodiac/safe'
import { randomAddress, randomHex } from '@zodiac/test-utils'
import { MockJsonRpcProvider } from '@zodiac/test-utils/rpc'
import { href } from 'react-router'
import {
  checkPermissions,
  execute,
  PermissionViolation,
  planExecution,
  queryRoutes,
} from 'ser-kit'
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

const mockExecute = vi.mocked(execute)
const mockPlanExecution = vi.mocked(planExecution)
const mockQueryRoutes = vi.mocked(queryRoutes)
const mockCheckPermissions = vi.mocked(checkPermissions)

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

describe('Sign', () => {
  const chainId = Chain.ETH
  const initiator = randomAddress()

  beforeEach(() => {
    vi.mocked(planExecution).mockResolvedValue([
      createMockExecuteTransactionAction(),
    ])

    mockJsonRpcProvider.mockReturnValue(new MockJsonRpcProvider())

    // @ts-expect-error We really only want to use this subset
    mockUseAccount.mockReturnValue({
      address: initiator,
      chainId,
    })

    // @ts-expect-error We just need this to be there
    mockUseConnectorClient.mockReturnValue({ data: {} })

    mockSimulateTransactionBundle.mockResolvedValue({
      error: null,
      approvals: [],
      tokenFlows: { sent: [], received: [], other: [] },
    })
  })

  describe('Route', () => {
    describe('Unknown route', () => {
      it('shows a warning to the user', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockResolvedValue([])

        await render(
          href('/submit/proposal/:proposalId', {
            proposalId: proposal.id,
          }),
          { tenant, user },
        )

        expect(
          screen.getByRole('alert', { name: 'Unknown route' }),
        ).toHaveAccessibleDescription(
          'The selected execution route appears invalid. Proceed with caution.',
        )
      })
    })

    describe('Ser unavailability', () => {
      it('shows the page even when ser-kit cannot query routes', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await expect(
          render(
            href('/submit/proposal/:proposalId', {
              proposalId: proposal.id,
            }),
            { tenant, user },
          ),
        ).resolves.not.toThrow()
      })

      it('shows a warning when ser is unavailable', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await render(
          href('/submit/proposal/:proposalId', {
            proposalId: proposal.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('alert', {
            name: 'Route validation unavailable',
          }),
        ).toHaveAccessibleDescription(
          'The selected execution route could not be validated. Proceed with caution.',
        )
      })

      it('enables the "Sign" button when ser is unavailable', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await render(
          href('/submit/proposal/:proposalId', {
            proposalId: proposal.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('button', { name: 'Sign' }),
        ).toBeEnabled()
      })
    })
  })

  describe('Permissions', () => {
    it('shows the permission error', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryRoutes.mockResolvedValue([
        toExecutionRoute({ wallet, account, route }),
      ])
      mockCheckPermissions.mockResolvedValue({
        success: false,
        error: PermissionViolation.AllowanceExceeded,
      })

      await render(
        href('/submit/proposal/:proposalId', {
          proposalId: proposal.id,
        }),
        { tenant, user },
      )

      expect(
        screen.getByRole('alert', { name: 'Permission violation' }),
      ).toHaveAccessibleDescription(PermissionViolation.AllowanceExceeded)
    })

    describe('Ser unavailability', () => {
      it('shows the page even when ser-kit cannot check permissions', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockResolvedValue([
          toExecutionRoute({ wallet, account, route }),
        ])
        mockCheckPermissions.mockRejectedValue('Ser is down')

        await expect(
          render(
            href('/submit/proposal/:proposalId', {
              proposalId: proposal.id,
            }),
            { tenant, user },
          ),
        ).resolves.not.toThrow()
      })

      it('shows a warning when ser is unavailable', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockResolvedValue([
          toExecutionRoute({ wallet, account, route }),
        ])
        mockCheckPermissions.mockRejectedValue('Ser is down')

        await render(
          href('/submit/proposal/:proposalId', {
            proposalId: proposal.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('alert', {
            name: 'Permissions check unavailable',
          }),
        ).toHaveAccessibleDescription(
          'We could not check the permissions for this route. Proceed with caution.',
        )
      })

      it('enables the "Sign" button when ser is unavailable', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, { address: initiator })
        const route = await routeFactory.create(account, wallet)
        const proposal = await transactionProposalFactory.create(
          tenant,
          user,
          account,
        )

        await setDefaultRoute(dbClient(), tenant, user, route)

        mockQueryRoutes.mockResolvedValue([
          toExecutionRoute({ wallet, account, route }),
        ])
        mockCheckPermissions.mockRejectedValue('Ser is down')

        await render(
          href('/submit/proposal/:proposalId', {
            proposalId: proposal.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('button', { name: 'Sign' }),
        ).toBeEnabled()
      })
    })
  })

  describe('Approvals', () => {
    beforeEach(() => {
      mockQueryRoutes.mockResolvedValue([])
    })

    it('does not revoke approvals by default', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockSimulateTransactionBundle.mockResolvedValue({
        error: null,
        approvals: [
          {
            spender: randomAddress(),
            tokenAddress: randomAddress(),
            symbol: '',
            logoUrl: '',
            decimals: 0,
            approvalAmount: 0n,
          },
        ],
        tokenFlows: { sent: [], received: [], other: [] },
      })

      await render(
        href('/submit/proposal/:proposalId', {
          proposalId: proposal.id,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('checkbox', { name: 'Revoke all approvals' }),
      ).not.toBeChecked()
    })
  })

  describe('Sign', () => {
    it('stores a reference to the transaction.', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      const testHash = randomHex(18)

      mockQueryRoutes.mockResolvedValue([])
      mockPlanExecution.mockResolvedValue([
        createMockExecuteTransactionAction({
          from: wallet.address,
        }),
      ])
      mockExecute.mockImplementation(async (_, state = []) => {
        state.push(testHash)
      })

      const { waitForPendingActions } = await render(
        href('/submit/proposal/:proposalId', {
          proposalId: proposal.id,
        }),
        { user, tenant },
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Sign' }))

      await waitFor(async () => {
        await waitForPendingActions()

        const [transaction] = await getTransactions(dbClient(), account.id)

        expect(transaction).toHaveProperty(
          'explorerUrl',
          new URL(`tx/${testHash}`, EXPLORER_URL[account.chainId]).toString(),
        )
      })
    })

    it('stores a reference to the multisig.', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      const testHash = randomHex(18)

      mockQueryRoutes.mockResolvedValue([])
      mockPlanExecution.mockResolvedValue([
        createMockProposeTransactionAction({
          proposer: wallet.address,
          safe: account.address,
        }),
      ])
      mockExecute.mockImplementation(async (_, state = []) => {
        state.push(testHash)
      })

      const { waitForPendingActions } = await render(
        href('/submit/proposal/:proposalId', {
          proposalId: proposal.id,
        }),
        { user, tenant },
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Sign' }))

      await waitFor(async () => {
        await waitForPendingActions()

        const [transaction] = await getTransactions(dbClient(), account.id)

        const url = multisigTransactionUrl(chainId, account.address, testHash)

        expect(transaction).toHaveProperty('safeWalletUrl', url.toString())
      })
    })

    it('links the proposal and the signed transaction', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      const testHash = randomHex(18)

      mockQueryRoutes.mockResolvedValue([])
      mockPlanExecution.mockResolvedValue([
        createMockExecuteTransactionAction({
          from: wallet.address,
        }),
      ])
      mockExecute.mockImplementation(async (_, state = []) => {
        state.push(testHash)
      })

      const { waitForPendingActions } = await render(
        href('/submit/proposal/:proposalId', {
          proposalId: proposal.id,
        }),
        { user, tenant },
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Sign' }))

      await waitFor(async () => {
        await waitForPendingActions()

        const [transaction] = await getTransactions(dbClient(), account.id)

        await expect(
          getProposedTransaction(dbClient(), proposal.id),
        ).resolves.toHaveProperty('signedTransactionId', transaction.id)
      })
    })
  })

  describe('Signed proposal', () => {
    it('disables the sign button', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const signedTransaction = await signedTransactionFactory.create(
        route,
        user,
      )
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
        {
          transaction: signedTransaction.transaction,
          signedTransactionId: signedTransaction.id,
        },
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryRoutes.mockResolvedValue([])

      await render(
        href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
        { user, tenant },
      )

      expect(await screen.findByRole('button', { name: 'Sign' })).toBeDisabled()
    })

    it('shows a message that the proposal has already been signed', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, { address: initiator })
      const route = await routeFactory.create(account, wallet)
      const signedTransaction = await signedTransactionFactory.create(
        route,
        user,
      )
      const proposal = await transactionProposalFactory.create(
        tenant,
        user,
        account,
        {
          transaction: signedTransaction.transaction,
          signedTransactionId: signedTransaction.id,
        },
      )

      await setDefaultRoute(dbClient(), tenant, user, route)

      mockQueryRoutes.mockResolvedValue([])

      await render(
        href('/submit/proposal/:proposalId', { proposalId: proposal.id }),
        { user, tenant },
      )

      const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'long',
        timeStyle: 'short',
      })

      expect(
        await screen.findByRole('alert', {
          name: 'Transaction bundle already signed',
        }),
      ).toHaveAccessibleDescription(
        `This transaction bundle has already been signed by ${user.fullName} on ${dateFormatter.format(signedTransaction.createdAt)}`,
      )
    })
  })
})
