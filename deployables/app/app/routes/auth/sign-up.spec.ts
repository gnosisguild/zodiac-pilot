import { render } from '@/test-utils'
import { createOrganization } from '@/workOS/server'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

const mockCreateOrganization = vi.mocked(createOrganization)

describe('Sign up', () => {
  it('is possible to create a new tenant', async () => {
    await render(href('/offline/sign-up'))

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Email' }),
      'john@doe.com',
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Organization name' }),
      'ACME',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))

    await expectRouteToBe(href('/offline/sign-up/success'))

    expect(mockCreateOrganization).toHaveBeenCalledWith({
      name: 'ACME',
      adminEmail: 'john@doe.com',
    })
  })
})
