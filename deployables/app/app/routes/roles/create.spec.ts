import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbIt, tenantFactory, userFactory } from '@zodiac/db/test-utils'
import { href } from 'react-router'
import { describe, expect } from 'vitest'

describe('Create role', () => {
  dbIt('is possible to create a new role', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)

    await render(
      href('/workspace/:workspaceId/roles/create', {
        workspaceId: tenant.defaultWorkspaceId,
      }),
      { tenant, user },
    )

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Label' }),
      'New role',
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Create' }))

    expect(
      await screen.findByRole('cell', { name: 'New role' }),
    ).toBeInTheDocument()
  })
})
