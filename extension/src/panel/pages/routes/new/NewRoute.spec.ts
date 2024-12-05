import { mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
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
  })
})
