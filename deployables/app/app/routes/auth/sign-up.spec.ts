import { dbClient, getTenants } from '@/db'
import { render } from '@/test-utils'
import { createOrganization } from '@/workOS'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectRouteToBe } from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/workOS', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/workOS')>()

  return {
    ...module,

    createOrganization: vi.fn(),
  }
})

const mockCreateOrganization = vi.mocked(createOrganization)

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

    await expectRouteToBe(href('/sign-up/success'))

    const [tenant] = await getTenants(dbClient())

    expect(tenant).toHaveProperty('name', 'ACME')
  })

  it('does not create a tenant when the workOS organization creation fails', async () => {
    mockCreateOrganization.mockRejectedValue(new Error('Boom'))

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

    await screen.findByRole('alert', { name: 'Sign up failed' })

    await expect(getTenants(dbClient())).resolves.toEqual([])
  })
})
