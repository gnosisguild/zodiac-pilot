import { mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { NewRoute } from './NewRoute'

describe('New route', () => {
  beforeEach(() => {
    mockRoutes()
  })

  describe('Label', () => {
    it('shows "Unnamed route" by default', async () => {
      await render('/routes/new', [
        { path: '/routes/new', Component: NewRoute },
      ])

      expect(
        screen.getByRole('heading', { name: 'New route' })
      ).toBeInTheDocument()
    })

    it('is possible to change the title of the route', async () => {
      await render('/routes/new', [
        { path: '/routes/new', Component: NewRoute },
      ])

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Route label' }),
        'Test route'
      )

      expect(
        screen.getByRole('heading', { name: 'Test route' })
      ).toBeInTheDocument()
    })
  })
})
