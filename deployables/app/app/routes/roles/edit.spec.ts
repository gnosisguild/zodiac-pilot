import { render } from '@/test-utils'
import { getTokens, getVerifiedTokens } from '@/token-list'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import {
  dbClient,
  getActivatedAccounts,
  getRole,
  getRoleActionAsset,
  getRoleActionAssets,
  getRoleActions,
  getRoleMembers,
  setActiveAccounts,
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
} from '@zodiac/db/test-utils'
import { AllowanceInterval } from '@zodiac/schema'
import {
  randomPrefixedAddress,
  selectOption,
  waitForPendingActions,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { unprefixAddress } from 'ser-kit'
import { beforeEach, describe, expect, vi } from 'vitest'

vi.mock('@/token-list', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/token-list')>()

  return {
    ...module,
    getTokens: vi.fn(),
    getVerifiedTokens: vi.fn(),
  }
})

const mockGetTokens = vi.mocked(getTokens)
const mockGetVerifiedTokens = vi.mocked(getVerifiedTokens)

describe('Edit role', () => {
  beforeEach(() => {
    mockGetTokens.mockResolvedValue({})
    mockGetVerifiedTokens.mockResolvedValue([])
  })

  describe('General', () => {
    dbIt('is possible to update the label', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user, {
        label: 'Test role',
      })

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        ' updated',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getRole(dbClient(), role.id)).resolves.toHaveProperty(
        'label',
        'Test role updated',
      )
    })

    describe('Members', () => {
      dbIt('is possible to add members', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Members' }),
        )
        await userEvent.click(
          await screen.findByRole('option', { name: user.fullName }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Save' }),
        )

        await waitForPendingActions()

        await expect(
          getRoleMembers(dbClient(), { roleId: role.id }),
        ).resolves.toEqual([user])
      })

      dbIt('is possible to remove members', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        await setRoleMembers(dbClient(), role, [user.id])

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Remove' }),
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Save' }),
        )

        await waitForPendingActions()

        await expect(
          getRoleMembers(dbClient(), { roleId: role.id }),
        ).resolves.not.toHaveProperty(role.id)
      })

      dbIt(
        'issues a warning when a member does not have a default wallet set for a configured chain',
        async () => {
          const user = await userFactory.create()
          const tenant = await tenantFactory.create(user)

          const role = await roleFactory.create(tenant, user)
          const account = await accountFactory.create(tenant, user)

          await setRoleMembers(dbClient(), role, [user.id])
          await setActiveAccounts(dbClient(), role, [account.id])

          await render(
            href('/workspace/:workspaceId/roles/:roleId', {
              workspaceId: tenant.defaultWorkspaceId,
              roleId: role.id,
            }),
            { tenant, user },
          )

          expect(
            await screen.findByRole('alert', {
              name: 'Default wallet missing',
            }),
          ).toHaveTextContent('User has no default wallet set for: Ethereum')
        },
      )
    })

    describe('Accounts', () => {
      dbIt('is possible to add an account', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user, {
          label: 'Test account',
        })

        const role = await roleFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('combobox', { name: 'Accounts' }),
        )
        await userEvent.click(
          await screen.findByRole('option', { name: 'Test account' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Save' }),
        )

        await waitForPendingActions()

        await expect(
          getActivatedAccounts(dbClient(), { roleId: role.id }),
        ).resolves.toEqual([account])
      })

      dbIt('is possible to remove an accounts from a role', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user, {
          label: 'Test account',
        })

        const role = await roleFactory.create(tenant, user)

        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Remove' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Save' }),
        )

        await waitForPendingActions()

        await expect(
          getActivatedAccounts(dbClient(), { roleId: role.id }),
        ).resolves.not.toHaveProperty(role.id)
      })
    })
  })

  describe('Role actions', async () => {
    dbIt('lists all current actions', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await roleActionFactory.create(role, user, { label: 'Test action' })

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      expect(
        await screen.findByRole('region', { name: 'Test action' }),
      ).toBeInTheDocument()
    })

    dbIt('is possible to edit an action', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const role = await roleFactory.create(tenant, user)

      await roleActionFactory.create(role, user, { label: 'Test action' })

      await render(
        href('/workspace/:workspaceId/roles/:roleId', {
          workspaceId: tenant.defaultWorkspaceId,
          roleId: role.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('link', { name: 'Edit action' }),
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Action label' }),
        ' updated',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      expect(
        await screen.findByRole('region', { name: 'Test action updated' }),
      ).toBeInTheDocument()
    })

    describe('Swapper action', () => {
      const wethAddress = randomPrefixedAddress()
      const aaveAddress = randomPrefixedAddress()

      const weth = {
        chainId: Chain.ETH,
        logoURI: '',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        address: wethAddress,
      }

      const aave = {
        chainId: Chain.ETH,
        logoURI: '',
        name: 'AAVE',
        symbol: 'AAVE',
        address: aaveAddress,
      }

      beforeEach(() => {
        mockGetTokens.mockResolvedValue({
          [wethAddress]: weth,
          [aaveAddress]: aave,
        })
        mockGetVerifiedTokens.mockImplementation(async ([address]) => {
          if (address === wethAddress) {
            return [weth]
          }

          if (address === aaveAddress) {
            return [aave]
          }

          return []
        })
      })

      dbIt(
        'is possible to define the assets that are allowed to be swapped',
        async () => {
          const user = await userFactory.create()
          const tenant = await tenantFactory.create(user)

          const role = await roleFactory.create(tenant, user)

          const account = await accountFactory.create(tenant, user, {
            chainId: Chain.ETH,
          })

          await setActiveAccounts(dbClient(), role, [account.id])

          await render(
            href('/workspace/:workspaceId/roles/:roleId', {
              workspaceId: tenant.defaultWorkspaceId,
              roleId: role.id,
            }),
            { tenant, user },
          )

          await userEvent.click(
            await screen.findByRole('link', { name: 'Add new action' }),
          )
          await userEvent.type(
            await screen.findByRole('textbox', { name: 'Action label' }),
            'Test action',
          )

          await selectOption('Sell', 'WETH')
          await selectOption('Buy', 'AAVE')

          await userEvent.click(
            await screen.findByRole('button', { name: 'Add' }),
          )

          await waitForPendingActions()

          const [action] = await getRoleActions(dbClient(), role.id)
          const assets = await getRoleActionAssets(dbClient(), {
            actionId: action.id,
          })

          expect(assets).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                symbol: 'WETH',
                allowBuy: false,
                allowSell: true,
              }),
              expect.objectContaining({
                symbol: 'AAVE',
                allowBuy: true,
                allowSell: false,
              }),
            ]),
          )
        },
      )

      dbIt(
        'is possible to change the assets that are allowed to be swapped',
        async () => {
          const user = await userFactory.create()
          const tenant = await tenantFactory.create(user)

          const role = await roleFactory.create(tenant, user)

          const account = await accountFactory.create(tenant, user, {
            chainId: Chain.ETH,
          })

          await roleActionFactory.create(role, user)

          await setActiveAccounts(dbClient(), role, [account.id])

          await render(
            href('/workspace/:workspaceId/roles/:roleId', {
              workspaceId: tenant.defaultWorkspaceId,
              roleId: role.id,
            }),
            { tenant, user },
          )

          await userEvent.click(
            await screen.findByRole('link', { name: 'Edit action' }),
          )

          await selectOption('Sell', 'WETH')
          await selectOption('Buy', 'AAVE')

          await userEvent.click(
            await screen.findByRole('button', { name: 'Update' }),
          )

          await waitForPendingActions()

          const [action] = await getRoleActions(dbClient(), role.id)
          const assets = await getRoleActionAssets(dbClient(), {
            actionId: action.id,
          })

          expect(assets).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                symbol: 'WETH',
                allowBuy: false,
                allowSell: true,
              }),
              expect.objectContaining({
                symbol: 'AAVE',
                allowBuy: true,
                allowSell: false,
              }),
            ]),
          )
        },
      )

      dbIt('it does not remove existing assets on edit', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        const account = await accountFactory.create(tenant, user, {
          chainId: Chain.ETH,
        })

        const action = await roleActionFactory.create(role, user)

        await roleActionAssetFactory.create(action, {
          symbol: 'WETH',
          address: unprefixAddress(wethAddress),
          allowSell: true,
          allowBuy: false,
        })

        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Edit action' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Update' }),
        )

        await waitForPendingActions()

        const assets = await getRoleActionAssets(dbClient(), {
          actionId: action.id,
        })

        expect(assets).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              symbol: 'WETH',
              allowBuy: false,
              allowSell: true,
            }),
          ]),
        )
      })

      dbIt('is possible to define an allowance for an asset', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const role = await roleFactory.create(tenant, user)

        const account = await accountFactory.create(tenant, user, {
          chainId: Chain.ETH,
        })

        const action = await roleActionFactory.create(role, user)

        const asset = await roleActionAssetFactory.create(action, {
          symbol: 'WETH',
          address: unprefixAddress(wethAddress),
          allowSell: true,
          allowBuy: false,
        })

        await setActiveAccounts(dbClient(), role, [account.id])

        await render(
          href('/workspace/:workspaceId/roles/:roleId', {
            workspaceId: tenant.defaultWorkspaceId,
            roleId: role.id,
          }),
          { tenant, user },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Edit allowance' }),
        )

        await userEvent.type(
          await screen.findByRole('spinbutton', { name: 'Allowance' }),
          '1000',
        )

        await selectOption('Interval', 'Daily')

        await userEvent.click(
          await screen.findByRole('button', { name: 'Update' }),
        )

        await waitForPendingActions()

        await expect(
          getRoleActionAsset(dbClient(), asset.id),
        ).resolves.toMatchObject({
          allowance: 1000n,
          interval: AllowanceInterval.Daily,
        })
      })
    })
  })
})
