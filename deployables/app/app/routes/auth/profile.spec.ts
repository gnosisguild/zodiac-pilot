import { dbClient, getWallets } from '@/db'
import { render, tenantFactory, userFactory } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Profile', () => {
  it('is possible to add new wallet', async () => {
    const tenant = await tenantFactory.create()
    const user = await userFactory.create(tenant)

    const { waitForPendingActions } = await render(href('/profile'), { user })

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
})
