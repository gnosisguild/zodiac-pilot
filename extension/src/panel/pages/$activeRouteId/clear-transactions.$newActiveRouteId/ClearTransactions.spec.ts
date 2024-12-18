import { expectRouteToBe, render } from '@/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { action, ClearTransactions } from './ClearTransactions'

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
    await render('/test-route/clear-transactions/new-route', [
      {
        path: '/:activeRouteId/clear-transactions/:newActiveRouteId',
        Component: ClearTransactions,
        action,
      },
    ])

    expect(mockClearTransactions).toHaveBeenCalled()
  })

  it('redirects to the new active route', async () => {
    await render(
      '/test-route/clear-transactions/new-route',
      [
        {
          path: '/:activeRouteId/clear-transactions/:newActiveRouteId',
          Component: ClearTransactions,
          action,
        },
      ],
      { inspectRoutes: ['/:activeRouteId'] },
    )

    await expectRouteToBe('/new-route')
  })
})
