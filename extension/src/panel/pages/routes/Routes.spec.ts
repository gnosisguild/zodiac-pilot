import { mockProviderRequest, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Routes } from './Routes'

describe('Routes', () => {
  it('shows an error when the user tries to connect a dApp', async () => {
    await render('/routes', [{ path: '/routes', Component: Routes }])

    await mockProviderRequest()

    expect(
      screen.getByRole('alert', { name: 'No active route' }),
    ).toHaveAccessibleDescription(
      'In order to connect Zodiac Pilot to a dApp you need to launch a route.',
    )
  })
})
