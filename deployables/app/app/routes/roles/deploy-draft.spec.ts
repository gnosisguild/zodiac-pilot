import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { Chain } from '@zodiac/chains'
import {
  dbClient,
  setActiveAccounts,
  setDefaultWallet,
  setRoleMembers,
} from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  roleActionAssetFactory,
  roleActionFactory,
  roleFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { encodeRoleKey } from '@zodiac/modules'
import { AllowanceInterval } from '@zodiac/schema'
import { href } from 'react-router'
import {
  Account,
  AccountType,
  planApplyAccounts,
  queryAccounts,
  withPredictedAddress,
} from 'ser-kit'
import { beforeEach, describe, expect, vi } from 'vitest'
import { getRefillPeriod } from './getRefillPeriod'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planApplyAccounts: vi.fn(),
    queryAccounts: vi.fn(),
  }
})

const mockQueryAccounts = vi.mocked(queryAccounts)
const mockPlanApplyAccounts = vi.mocked(planApplyAccounts)

describe('Deploy Role', () => {
  beforeEach(() => {
    mockQueryAccounts.mockResolvedValue([])
    mockPlanApplyAccounts.mockResolvedValue([])

    vi.setSystemTime(new Date())
  })

  describe('Warnings', () => {
    describe('Members', () => {
      dbIt('warns when no members have been selected', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
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
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
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
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
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
        href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          draftId: role.id,
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
        href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          draftId: role.id,
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
        href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          draftId: role.id,
        }),
        { tenant, user },
      )

      expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
        desired: expect.not.arrayContaining([existingSafe]),
      })
    })
  })

  describe('Roles mods', () => {
    dbIt('creates a roles mod', async () => {
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

      await setActiveAccounts(dbClient(), role, [account.id])

      await render(
        href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
          workspaceId: tenant.defaultWorkspaceId,
          draftId: role.id,
        }),
        { tenant, user },
      )

      expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
        desired: expect.arrayContaining([
          withPredictedAddress<Extract<Account, { type: AccountType.ROLES }>>(
            {
              type: AccountType.ROLES,
              chain: Chain.ETH,
              modules: [],
              allowances: [],
              multisend: [],
              avatar: account.address,
              owner: account.address,
              target: account.address,
              roles: [
                {
                  key: encodeRoleKey(role.key),
                  annotations: [],
                  members: [],
                  targets: [],
                },
              ],
              version: 2,
              nonce: role.nonce,
            },
            role.nonce,
          ),
        ]),
      })
    })

    describe('Actions', () => {
      dbIt('adds roles for the respective actions', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user, {
          chainId: Chain.ETH,
        })
        const role = await roleFactory.create(tenant, user)
        await roleActionFactory.create(role, user)

        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
          }),
          { tenant, user },
        )

        expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
          desired: expect.arrayContaining([
            withPredictedAddress<Extract<Account, { type: AccountType.ROLES }>>(
              {
                type: AccountType.ROLES,
                chain: Chain.ETH,
                modules: [],
                allowances: [],
                multisend: [],
                avatar: account.address,
                owner: account.address,
                target: account.address,
                roles: [
                  {
                    key: encodeRoleKey(role.key),
                    members: [],
                    annotations: [],
                    targets: [],
                  },
                ],
                version: 2,
                nonce: role.nonce,
              },
              role.nonce,
            ),
          ]),
        })
      })
    })

    describe('Members', () => {
      dbIt('adds the correct members to the roles mod', async () => {
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
        await roleActionFactory.create(role, user)

        await setRoleMembers(dbClient(), role, [user.id])
        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
          }),
          { tenant, user },
        )

        const userSafe = withPredictedAddress<
          Extract<Account, { type: AccountType.SAFE }>
        >(
          {
            type: AccountType.SAFE,
            chain: Chain.ETH,
            modules: [],
            owners: [wallet.address],
            threshold: 1,
          },
          user.nonce,
        )

        expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
          desired: expect.arrayContaining([
            withPredictedAddress<Extract<Account, { type: AccountType.ROLES }>>(
              {
                type: AccountType.ROLES,
                chain: Chain.ETH,
                modules: [],
                allowances: [],
                multisend: [],
                avatar: account.address,
                owner: account.address,
                target: account.address,
                roles: [
                  {
                    key: encodeRoleKey(role.key),
                    members: [userSafe.address],
                    annotations: [],
                    targets: [],
                  },
                ],
                version: 2,
                nonce: role.nonce,
              },
              role.nonce,
            ),
          ]),
        })
      })

      dbIt('keeps members when member safes already exist', async () => {
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
        await roleActionFactory.create(role, user)

        await setRoleMembers(dbClient(), role, [user.id])
        await setActiveAccounts(dbClient(), role, [account.id])

        const userSafe = withPredictedAddress<
          Extract<Account, { type: AccountType.SAFE }>
        >(
          {
            type: AccountType.SAFE,
            chain: Chain.ETH,
            modules: [],
            owners: [wallet.address],
            threshold: 1,
          },
          user.nonce,
        )

        mockQueryAccounts.mockResolvedValue([userSafe])

        await render(
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
          }),
          { tenant, user },
        )

        expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
          desired: expect.arrayContaining([
            withPredictedAddress<Extract<Account, { type: AccountType.ROLES }>>(
              {
                type: AccountType.ROLES,
                chain: Chain.ETH,
                modules: [],
                allowances: [],
                multisend: [],
                avatar: account.address,
                owner: account.address,
                target: account.address,
                roles: [
                  {
                    key: encodeRoleKey(role.key),
                    members: [userSafe.address],
                    annotations: [],
                    targets: [],
                  },
                ],
                version: 2,
                nonce: role.nonce,
              },
              role.nonce,
            ),
          ]),
        })
      })
    })

    describe('Allowances', () => {
      dbIt('creates global allowance entries', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user, {
          chainId: Chain.ETH,
        })
        const role = await roleFactory.create(tenant, user)
        const action = await roleActionFactory.create(role, user)

        const asset = await roleActionAssetFactory.create(action, {
          allowance: 1000n,
          interval: AllowanceInterval.Monthly,
        })

        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/drafts/:draftId/deploy', {
            workspaceId: tenant.defaultWorkspaceId,
            draftId: role.id,
          }),
          { tenant, user },
        )

        expect(mockPlanApplyAccounts).toHaveBeenCalledWith({
          desired: expect.arrayContaining([
            withPredictedAddress<Extract<Account, { type: AccountType.ROLES }>>(
              {
                type: AccountType.ROLES,
                chain: Chain.ETH,
                modules: [],
                allowances: [
                  {
                    key: encodeRoleKey(asset.allowanceKey),
                    period: getRefillPeriod(AllowanceInterval.Monthly),
                    balance: 1000n,
                    maxRefill: 1000n,
                    refill: 1000n,
                    timestamp: BigInt(new Date().getTime()),
                  },
                ],
                multisend: [],
                avatar: account.address,
                owner: account.address,
                target: account.address,
                roles: [
                  {
                    key: encodeRoleKey(role.key),
                    annotations: expect.anything(),
                    members: [],
                    targets: expect.anything(),
                  },
                ],
                version: 2,
                nonce: role.nonce,
              },
              role.nonce,
            ),
          ]),
        })
      })
    })
  })
})
