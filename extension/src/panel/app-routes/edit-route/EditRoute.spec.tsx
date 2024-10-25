import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { Outlet } from 'react-router-dom'
import { describe, it, vi } from 'vitest'
import { EditRoute } from './EditRoute'

vi.mock('./wallet', () => ({ ConnectWallet: Outlet }))

describe('Edit Zodiac route', () => {
  it('does not explode', async () => {
    render('/routes/route-id', [
      {
        path: '/routes/:routeId',
        Component: EditRoute,
      },
    ])

    await screen.findByRole('textbox', { name: 'Route label' })
  })
})
