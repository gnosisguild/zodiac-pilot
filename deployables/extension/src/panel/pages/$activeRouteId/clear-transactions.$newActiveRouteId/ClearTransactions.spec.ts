import { mockRoutes, render } from '@/test-utils'
import { expectRouteToBe } from '@zodiac/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockClearTransactions } = vi.hoisted(() => ({
  mockClearTransactions: vi.fn(),
}))

vi.mock('./useClearTransactions', () => ({
  useClearTransactions: () => mockClearTransactions,
}))

describe('Clear transactions', () => {
  beforeEach(() => {
    mockClearTransactions.mockResolvedValue(undefined)
  })

  it('clears all transactions', async () => {
    await mockRoutes({ id: 'test-route' }, { id: 'new-route' })

    await render('/test-route/clear-transactions/new-route')

    expect(mockClearTransactions).toHaveBeenCalled()
  })

  it('redirects to the new active route', async () => {
    await mockRoutes({ id: 'test-route' }, { id: 'new-route' })

    await render('/test-route/clear-transactions/new-route')

    await expectRouteToBe('/new-route/transactions')
  })
})
