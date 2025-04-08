import { dbClient, getAccount } from '@/db'
import {
  accountFactory,
  render,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { queryInitiators } from 'ser-kit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryInitiators: vi.fn(),
  }
})

const mockQueryInitiators = vi.mocked(queryInitiators)

describe('Edit account', () => {
  describe('Label', () => {
    it('displays the current label', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(user, { label: 'Test label' })

      await render(href('/account/:accountId', { accountId: account.id }), {
        user,
      })

      expect(await screen.findByRole('textbox', { name: 'Label' })).toHaveValue(
        'Test label',
      )
    })

    it('is possible to update the label', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(user, { label: '' })

      const { waitForPendingActions } = await render(
        href('/account/:accountId', { accountId: account.id }),
        { user },
      )

      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        'New label',
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getAccount(dbClient(), account.id)).resolves.toHaveProperty(
        'label',
        'New label',
      )
    })
  })

  describe('Pilot Signer', () => {
    it('lists all wallets that can be signers on the selected account', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(user)

      const address = randomAddress()

      await walletFactory.create(user, { label: 'Test Wallet', address })

      mockQueryInitiators.mockResolvedValue([address])

      await render(href('/account/:accountId', { accountId: account.id }), {
        user,
      })

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )

      expect(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      ).toBeInTheDocument()
    })
  })
})
