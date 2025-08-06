import { render } from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import {
  dbClient,
  findDefaultWallet,
  getDefaultWallet,
  getWallet,
  getWallets,
  setDefaultRoute,
  setDefaultWallet,
} from '@zodiac/db'
import {
  accountFactory,
  dbIt,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import {
  randomAddress,
  selectOption,
  waitForPendingActions,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { getAddress } from 'viem'
import { describe, expect } from 'vitest'
import { Intent } from './intents'

describe('Profile', () => {
  describe('Wallets', () => {
    describe('List', () => {
      dbIt('lists all existing wallets', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const address = randomAddress()

        await walletFactory.create(user, { label: 'User wallet', address })

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          { tenant, user },
        )

        expect(
          await screen.findByRole('cell', { name: 'User wallet' }),
        ).toBeInTheDocument()
        expect(
          await screen.findByRole('cell', { name: getAddress(address) }),
        ).toBeInTheDocument()
      })
    })

    describe('Create', () => {
      dbIt('is possible to add new wallet', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          {
            tenant,
            user,
          },
        )

        const address = randomAddress()

        await userEvent.click(
          await screen.findByRole('link', { name: 'Add Wallet' }),
        )

        await userEvent.type(
          await screen.findByRole('textbox', { name: 'Label' }),
          'Test',
        )
        await userEvent.type(
          await screen.findByRole('textbox', { name: 'Address' }),
          address,
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Add' }),
        )

        await waitForPendingActions()

        const [wallet] = await getWallets(dbClient(), user.id)

        expect(wallet).toHaveProperty('label', 'Test')
        expect(wallet).toHaveProperty('address', address)
      })

      dbIt('is not possible to create duplicate wallets', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const address = randomAddress()

        await walletFactory.create(user, {
          address,
          label: 'Existing wallet',
        })

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          {
            tenant,
            user,
          },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Add Wallet' }),
        )

        await userEvent.type(
          await screen.findByRole('textbox', { name: 'Label' }),
          'Test',
        )
        await userEvent.type(
          await screen.findByRole('textbox', { name: 'Address' }),
          address,
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Add' }),
        )

        await waitForPendingActions()

        expect(
          await screen.findByRole('alert', { name: 'Wallet already exists' }),
        ).toHaveAccessibleDescription(
          `A wallet with this address already exists under the name "Existing wallet".`,
        )
      })
    })

    describe('Remove', () => {
      dbIt('is possible to remove a wallet', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const wallet = await walletFactory.create(user, {
          label: 'User wallet',
        })

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          {
            tenant,
            user,
          },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Remove wallet' }),
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Remove' }),
        )

        await waitForPendingActions()

        const [deletedWallet] = await getWallets(dbClient(), user.id, {
          deleted: true,
        })

        expect(deletedWallet).toMatchObject({
          id: wallet.id,

          deleted: true,
          deletedById: user.id,
        })
      })

      dbIt('lists accounts that use this wallet', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const account = await accountFactory.create(tenant, user, {
          label: 'Test account',
        })
        const wallet = await walletFactory.create(user, {
          label: 'User wallet',
        })

        const route = await routeFactory.create(account, wallet)

        await setDefaultRoute(dbClient(), tenant, user, route)

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          {
            tenant,
            user,
          },
        )

        await userEvent.click(
          await screen.findByRole('link', { name: 'Remove wallet' }),
        )

        const { getByRole } = within(
          await screen.findByRole('list', {
            name: 'Used to access these accounts',
          }),
        )

        expect(
          getByRole('listitem', { name: 'Test account' }),
        ).toBeInTheDocument()
      })
    })

    describe('Edit', () => {
      dbIt('is possible to rename a wallet', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        const address = randomAddress()

        const wallet = await walletFactory.create(user, {
          address,
          label: 'Existing wallet',
        })

        await render(
          href('/workspace/:workspaceId/profile', {
            workspaceId: tenant.defaultWorkspaceId,
          }),
          {
            tenant,
            user,
          },
        )

        await userEvent.click(
          await screen.findByRole('button', { name: 'Edit wallet' }),
        )
        await userEvent.type(
          await screen.findByRole('textbox', { name: 'Label' }),
          ' updated',
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Save' }),
        )

        await waitForPendingActions()

        await expect(getWallet(dbClient(), wallet.id)).resolves.toHaveProperty(
          'label',
          'Existing wallet updated',
        )
      })
    })
  })

  describe('Default wallet', () => {
    dbIt('is possible to define a default wallet per chain', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user, { label: 'Test wallet' })

      await render(
        href('/workspace/:workspaceId/profile', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await selectOption('Default wallet for Ethereum', 'Test wallet')

      await waitForPendingActions(Intent.UpdateDefaultWallet)

      await expect(
        getDefaultWallet(dbClient(), user, Chain.ETH),
      ).resolves.toEqual(wallet)
    })

    dbIt('is possible to remove the current default wallet', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const wallet = await walletFactory.create(user, { label: 'Test wallet' })

      await setDefaultWallet(dbClient(), user, {
        walletId: wallet.id,
        chainId: Chain.ETH,
      })

      await render(
        href('/workspace/:workspaceId/profile', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Remove default wallet for Ethereum',
        }),
      )

      await waitForPendingActions(Intent.UpdateDefaultWallet)

      await expect(
        findDefaultWallet(dbClient(), user, Chain.ETH),
      ).resolves.toBeNull()
    })
  })
})
