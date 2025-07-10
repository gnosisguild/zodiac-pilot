import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getFeatures } from '@zodiac/db'
import {
  featureFactory,
  tenantFactory,
  userFactory,
} from '@zodiac/db/test-utils'
import { waitForPendingActions } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Features', () => {
  describe('List', () => {
    it('lists all features', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await featureFactory.create({ name: 'Test feature' })

      await render(href('/system-admin/features'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      expect(
        await screen.findByRole('cell', { name: 'Test feature' }),
      ).toBeInTheDocument()
    })
  })

  describe('Add', () => {
    it('is possible to add a new feature', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await render(href('/system-admin/features'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(
        await screen.findByRole('link', { name: 'Create new feature' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Name' }),
        'New feature',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Create' }),
      )

      expect(
        await screen.findByRole('cell', { name: 'New feature' }),
      ).toBeInTheDocument()
    })
  })

  describe('Remove', () => {
    it('is possible to remove a feature', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      await featureFactory.create({ name: 'Test feature' })

      await render(href('/system-admin/features'), {
        user,
        tenant,
        isSystemAdmin: true,
      })

      await userEvent.click(await screen.findByRole('link', { name: 'Remove' }))

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove' }),
      )

      await waitForPendingActions()

      await expect(getFeatures(dbClient())).resolves.toEqual([])
    })
  })
})
