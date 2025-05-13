import { createTransaction } from '@/test-utils'
import { describe, expect, it } from 'vitest'
import { clearTransactions } from './actions'
import { transactionsReducer } from './reducer'

describe('Transactions reducer', () => {
  describe('Clear', () => {
    it('is possible to remove all transactions', () => {
      const initialState = [createTransaction(), createTransaction()]

      expect(transactionsReducer(initialState, clearTransactions())).toEqual([])
    })

    it('is possible to remove all transactions to a given end point', () => {
      const transactionA = createTransaction()
      const transactionB = createTransaction()
      const transactionC = createTransaction()

      const initialState = [transactionA, transactionB, transactionC]

      expect(
        transactionsReducer(
          initialState,
          clearTransactions({ fromId: transactionB.id }),
        ),
      ).toEqual([transactionA])
    })
  })
})
