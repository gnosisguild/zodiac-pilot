import { simulateTransactionBundle } from '@/simulation-server'
import { createMockExecuteTransactionAction, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import {
  dbClient,
  getProposedTransactions,
  setActiveAccounts,
  setDefaultRoute,
  setDefaultWallet,
  setRoleMembers,
} from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  roleFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import {
  createMockSafeAccount,
  createMockTransactionRequest,
} from '@zodiac/modules/test-utils'
import {
  expectRouteToBe,
  randomAddress,
  waitForPendingActions,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import {
  Account,
  AccountType,
  checkPermissions,
  planApplyAccounts,
  planExecution,
  queryAccounts,
  queryRoutes,
  withPredictedAddress,
} from 'ser-kit'
import { beforeEach, describe, expect, vi } from 'vitest'
import { Intent } from './intents'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planApplyAccounts: vi.fn(),
    queryAccounts: vi.fn(),
    planExecution: vi.fn(),
    queryRoutes: vi.fn(),
    checkPermissions: vi.fn(),
  }
})

const mockQueryAccounts = vi.mocked(queryAccounts)
const mockPlanApplyAccounts = vi.mocked(planApplyAccounts)
const mockPlanExecution = vi.mocked(planExecution)
const mockQueryRoutes = vi.mocked(queryRoutes)
const mockCheckPermissions = vi.mocked(checkPermissions)

vi.mock('@/simulation-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/simulation-server')>()

  return {
    ...module,

    simulateTransactionBundle: vi.fn(),
  }
})

const mockSimulateTransactionBundle = vi.mocked(simulateTransactionBundle)

describe('Deploy Role', () => {
  beforeEach(() => {
    mockPlanExecution.mockResolvedValue([createMockExecuteTransactionAction()])
    mockQueryRoutes.mockResolvedValue([])
    mockCheckPermissions.mockResolvedValue({ success: true, error: undefined })
    mockQueryAccounts.mockResolvedValue([])
    mockPlanApplyAccounts.mockResolvedValue([])

    mockSimulateTransactionBundle.mockResolvedValue({
      error: null,
      approvals: [],
      tokenFlows: { sent: [], received: [], other: [] },
    })

    vi.setSystemTime(new Date())
  })

  describe('Warnings', () => {
    describe('Members', () => {
      dbIt('warns when no members have been selected', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/roles/:roleId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('alert', { name: 'Members missing' }),
        ).toHaveAccessibleDescription(
          'You have not selected any members that should be part of this role.',
        )
      })

      dbIt('warns when not all members have default safes set up', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user)
        const role = await roleFactory.create(tenant, user)

        await setActiveAccounts(dbClient(), role, [account.id])
        await setRoleMembers(dbClient(), role, [user.id])

        await render(
          href('/workspace/:workspaceId/roles/:roleId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('alert', { name: 'Members missing' }),
        ).toHaveAccessibleDescription(
          'Not all members have selected a default safes for the chains this role will be deployed to. This means the role will not be active for them on these chains.',
        )
      })
    })

    describe('Accounts', () => {
      dbIt('warns when no account shave been selected', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/roles/:roleId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('alert', { name: 'Accounts missing' }),
        ).toHaveAccessibleDescription(
          'You have not selected any accounts that this role should be active on.',
        )
      })
    })
  })

  describe('Member Safes', () => {
    dbIt('creates a Safe for each member', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)

      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ETH,
      })

      const account = await accountFactory.create(tenant, user, {
        chainId: Chain.ETH,
      })
      const role = await roleFactory.create(tenant, user)

      await setRoleMembers(dbClient(), role, [user.id])
      await setActiveAccounts(dbClient(), role, [account.id])

      await render(
        href('/workspace/:workspaceId/roles/:roleId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
        desired: expect.arrayContaining([
          withPredictedAddress<Extract<Account, { type: AccountType.SAFE }>>(
            {
              type: AccountType.SAFE,
              chain: Chain.ETH,
              modules: [],
              threshold: 1,
              owners: [wallet.address],
            },
            user.nonce,
          ),
        ]),
      })
    })

    dbIt('creates a Safe for each member on each chain', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)

      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ETH,
      })
      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ARB1,
      })

      const accountA = await accountFactory.create(tenant, user, {
        chainId: Chain.ETH,
      })
      const accountB = await accountFactory.create(tenant, user, {
        chainId: Chain.ARB1,
      })
      const role = await roleFactory.create(tenant, user)

      await setRoleMembers(dbClient(), role, [user.id])
      await setActiveAccounts(dbClient(), role, [accountA.id, accountB.id])

      await render(
        href('/workspace/:workspaceId/roles/:roleId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
        desired: expect.arrayContaining([
          withPredictedAddress<Extract<Account, { type: AccountType.SAFE }>>(
            {
              type: AccountType.SAFE,
              chain: Chain.ETH,
              modules: [],
              threshold: 1,
              owners: [wallet.address],
            },
            user.nonce,
          ),
          withPredictedAddress<Extract<Account, { type: AccountType.SAFE }>>(
            {
              type: AccountType.SAFE,
              chain: Chain.ARB1,
              modules: [],
              threshold: 1,
              owners: [wallet.address],
            },
            user.nonce,
          ),
        ]),
      })
    })

    dbIt('re-uses Safes when they already exist', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)

      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ETH,
      })

      const account = await accountFactory.create(tenant, user, {
        chainId: Chain.ETH,
      })
      const role = await roleFactory.create(tenant, user)

      await setRoleMembers(dbClient(), role, [user.id])
      await setActiveAccounts(dbClient(), role, [account.id])

      const existingSafe = withPredictedAddress<
        Extract<Account, { type: AccountType.SAFE }>
      >(
        {
          type: AccountType.SAFE,
          chain: Chain.ETH,
          modules: [],
          threshold: 1,
          owners: [wallet.address],
        },
        user.nonce,
      )

      mockQueryAccounts.mockResolvedValue([existingSafe])

      await render(
        href('/workspace/:workspaceId/roles/:roleId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
        desired: expect.not.arrayContaining([existingSafe]),
      })
    })
  })

  describe('Execute', () => {
    describe('Route selection', () => {
      dbIt.todo(
        'offers to complete the route setup when no route is configured for the respective account',
      )
      dbIt.todo('allows you to select a route to use to execute a step')
    })

    dbIt('redirects the user to a prepared transaction proposal', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user)

      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ETH,
      })

      const account = await accountFactory.create(tenant, user, {
        chainId: Chain.ETH,
      })
      const route = await routeFactory.create(account, wallet)

      await setDefaultRoute(dbClient(), tenant, user, route)

      const role = await roleFactory.create(tenant, user)

      await setRoleMembers(dbClient(), role, [user.id])
      await setActiveAccounts(dbClient(), role, [account.id])

      const transaction = createMockTransactionRequest()

      mockPlanApplyAccounts.mockResolvedValue([
        {
          account: createMockSafeAccount({
            address: account.address,
            chainId: account.chainId,
            owners: [wallet.address],
          }),
          steps: [
            {
              call: {
                call: 'createNode',
                accountType: AccountType.ROLES,
                args: {
                  avatar: account.address,
                  owner: wallet.address,
                  target: account.address,
                },
                creationNonce: account.nonce,
                deploymentAddress: randomAddress(),
              },
              from: account.address,
              transaction,
            },
          ],
        },
      ])

      await render(
        href('/workspace/:workspaceId/roles/:roleId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Deploy' }),
      )

      await waitForPendingActions(Intent.ExecuteTransaction)

      const [transactionProposal] = await getProposedTransactions(
        dbClient(),
        user,
        account,
      )

      await expectRouteToBe(
        href('/workspace/:workspaceId/submit/proposal/:proposalId/:routeId', {
          workspaceId: tenant.defaultWorkspaceId,
          proposalId: transactionProposal.id,
          routeId: route.id,
        }),
      )
    })
  })
})
