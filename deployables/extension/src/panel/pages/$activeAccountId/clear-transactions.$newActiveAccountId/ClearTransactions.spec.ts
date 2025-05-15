import { createConfirmedTransaction, mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { expectRouteToBe } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'

describe('Clear transactions', () => {
  it('clears all transactions', async () => {
    await mockRoutes({ id: 'test-route' }, { id: 'new-route' })

    await render('/test-route/clear-transactions/new-route', {
      initialState: { executed: [createConfirmedTransaction()] },
    })

    expect(
      await screen.findByRole('alert', { name: 'No transactions' }),
    ).toBeInTheDocument()
  })

  it('redirects to the new active route', async () => {
    await mockRoutes({ id: 'test-route' }, { id: 'new-route' })

    await render('/test-route/clear-transactions/new-route')

    await expectRouteToBe('/new-route/transactions')
  })
})
