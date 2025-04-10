import { dbClient, getWallets } from '@/db'
import { render, tenantFactory, userFactory, walletFactory } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
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

  it('lists all existing wallets', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const address = randomAddress()

    await walletFactory.create(tenant, user, { label: 'User wallet', address })

    await render(href('/profile'), { tenant, user })

    expect(
      await screen.findByRole('cell', { name: 'User wallet' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('cell', { name: getAddress(address) }),
    ).toBeInTheDocument()
  })

  it('is possible to remove a wallet', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)
    const wallet = await walletFactory.create(tenant, user, {
      label: 'User wallet',
    })

    const { waitForPendingActions } = await render(href('/profile'), {
      tenant,
      user,
    })

    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove wallet' }),
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

  it('is not possible to create duplicate wallets', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const address = randomAddress()

    await walletFactory.create(tenant, user, {
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
