import { render } from '@/test-utils'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { activateRoute, dbClient, getWallet, getWallets } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
  describe('List', () => {
    it('lists all existing wallets', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const address = randomAddress()

      await walletFactory.create(user, { label: 'User wallet', address })

      await render(href('/profile'), { tenant, user })

      expect(
        await screen.findByRole('cell', { name: 'User wallet' }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('cell', { name: getAddress(address) }),
      ).toBeInTheDocument()
    })
  })

  describe('Create', () => {
    it('is possible to add new wallet', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const { waitForPendingActions } = await render(href('/profile'), {
        tenant,
        user,
      })

      const address = randomAddress()

      await userEvent.click(
        await screen.findByRole('button', { name: 'Add Wallet' }),
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'Test',
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Address' }),
        address,
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

      await waitForPendingActions()

      const [wallet] = await getWallets(dbClient(), user.id)

      expect(wallet).toHaveProperty('label', 'Test')
      expect(wallet).toHaveProperty('address', address)
    })

    it('is not possible to create duplicate wallets', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const address = randomAddress()

      await walletFactory.create(user, {
        address,
        label: 'Existing wallet',
      })

      const { waitForPendingActions } = await render(href('/profile'), {
        tenant,
        user,
      })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Add Wallet' }),
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'Test',
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Address' }),
        address,
      )

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

      await waitForPendingActions()

      expect(
        await screen.findByRole('alert', { name: 'Wallet already exists' }),
      ).toHaveAccessibleDescription(
        `A wallet with this address already exists under the name "Existing wallet".`,
      )
    })
  })

  describe('Remove', () => {
    it('is possible to remove a wallet', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const wallet = await walletFactory.create(user, {
        label: 'User wallet',
      })

      const { waitForPendingActions } = await render(href('/profile'), {
        tenant,
        user,
      })

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

    it('lists accounts that use this wallet', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user, {
        label: 'Test account',
      })
      const wallet = await walletFactory.create(user, {
        label: 'User wallet',
      })

      const route = await routeFactory.create(account, wallet)

      await activateRoute(dbClient(), tenant, user, route)

      await render(href('/profile'), {
        tenant,
        user,
      })

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
    it('is possible to rename a wallet', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const address = randomAddress()

      const wallet = await walletFactory.create(user, {
        address,
        label: 'Existing wallet',
      })

      const { waitForPendingActions } = await render(href('/profile'), {
        tenant,
        user,
      })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Edit wallet' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        ' updated',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getWallet(dbClient(), wallet.id)).resolves.toHaveProperty(
        'label',
        'Existing wallet updated',
      )
    })
  })
})
