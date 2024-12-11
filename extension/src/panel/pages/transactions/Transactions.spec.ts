import { createTransaction, mockRoutes, render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Transactions } from './Transactions'

describe('Transactions', () => {
  describe('List', () => {
    it('lists transactions', async () => {
      mockRoutes()

      await render('/', [{ path: '/', Component: Transactions }], {
        initialState: [createTransaction()],
      })

      expect(
        screen.getByRole('region', { name: 'Raw transaction' }),
      ).toBeInTheDocument()
    })
  })
})
