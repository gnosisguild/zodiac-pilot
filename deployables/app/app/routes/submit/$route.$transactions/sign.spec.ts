import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { encode } from '@zodiac/schema'
import {
  createMockSerRoute,
  createMockTransaction,
  expectRouteToBe,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { queryRoutes } from 'ser-kit'
import { describe, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planExecution: vi.fn(),
    queryRoutes: vi.fn(),
  }
})

const mockQueryRoutes = vi.mocked(queryRoutes)

describe('Sign', () => {
  describe('Route', () => {
    it('is possible to update the route', async () => {
      const currentRoute = createMockSerRoute()
      const newRoute = createMockSerRoute()
      const transaction = createMockTransaction()

      await render(
        href('/submit/:route/:transactions', {
          route: encode(currentRoute),
          transactions: encode([transaction]),
        }),
      )

      mockQueryRoutes.mockResolvedValue([currentRoute, newRoute])

      await userEvent.click(
        screen.getByRole('link', { name: 'Select a different route' }),
      )

      await userEvent.click((await screen.findAllByRole('radio'))[1])

      await userEvent.click(screen.getByRole('button', { name: 'Use' }))

      await expectRouteToBe(
        href('/submit/:route/:transactions', {
          route: encode(newRoute),
          transactions: encode([transaction]),
        }),
      )
    })
  })
})
