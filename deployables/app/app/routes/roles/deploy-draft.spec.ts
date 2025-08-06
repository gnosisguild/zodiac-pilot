import { render } from '@/test-utils'
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
  roleFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import {
  Account,
  AccountType,
  planApplyAccounts,
  queryAccounts,
  withPredictedAddress,
} from 'ser-kit'
import { beforeEach, describe, expect, vi } from 'vitest'

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
    dbIt.todo('re-uses Safes when they already exist')
  })

  describe('Roles mods', () => {
    dbIt.todo('creates a roles mod on each chain')
  })
})
