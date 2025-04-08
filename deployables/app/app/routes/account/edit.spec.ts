import { dbClient, getAccount } from '@/db'
import {
  accountFactory,
  render,
  tenantFactory,
  userFactory,
} from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Edit account', () => {
  describe('Label', () => {
    it('displays the current label', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(user, { label: 'Test label' })

      await render(href('/account/:accountId', { accountId: account.id }))

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
})
