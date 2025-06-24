import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Routes', () => {
  describe('Label', () => {
    it('is possible to change the label of a route', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const route = await routeFactory.create(account, wallet, {
        label: 'Test route',
      })

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Edit route label' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        ' Updated',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      expect(
        await screen.findByRole('tab', { name: `${route.label} Updated` }),
      ).toBeInTheDocument()
    })
  })
})
