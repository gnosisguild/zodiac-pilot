import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { encode } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createMockTransaction,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { describe, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planExecution: vi.fn(),
  }
})

describe('Sign', () => {
  describe('Route', () => {
    it('is possible to update the route', async () => {
      await render(
        href('/submit/:route/:transactions', {
          route: encode(
            createMockExecutionRoute({
              initiator: randomPrefixedAddress(),
            }),
          ),
          transactions: encode([createMockTransaction()]),
        }),
      )

      await userEvent.click(
        screen.getByRole('link', { name: 'Select a different route' }),
      )
    })
  })
})
