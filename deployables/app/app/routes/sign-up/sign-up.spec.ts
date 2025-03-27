import { dbClient, getTenants } from '@/db'
import { render } from '@/test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { href } from 'react-router'
import { describe, expect, it } from 'vitest'

describe('Sign up', () => {
  it('is possible to create a new tenant', async () => {
    await render(href('/sign-up'))

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'john@doe.com',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Organization name' }),
      'ACME',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(async () => {
      const [tenant] = await getTenants(dbClient())

      expect(tenant).toHaveProperty('name', 'ACME')
    })
  })
})
