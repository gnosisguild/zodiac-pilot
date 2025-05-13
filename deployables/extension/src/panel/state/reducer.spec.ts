import { createTransaction } from '@/test-utils'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import { appendTransaction, clearTransactions } from './actions'
import { transactionsReducer, type State } from './reducer'

describe('Transactions reducer', () => {
  const createState = (initialState: Partial<State> = {}): State => ({
    pending: [],
    done: [],
    failed: [],
    reverted: [],

    ...initialState,
  })

  describe('Append', () => {
    it('adds a transaction to the pending queue', () => {
      const transaction = createMockTransactionRequest()

      expect(
        transactionsReducer(
          createState(),
          appendTransaction({ id: 'test', transaction }),
        ),
      ).toMatchObject({
        pending: [{ id: 'test', ...transaction }],
      })
    })
  })

  describe('Clear', () => {
    it('is possible to remove all transactions', () => {
      const initialState = createState({
        done: [createTransaction(), createTransaction()],
      })

      expect(
        transactionsReducer(initialState, clearTransactions()),
      ).toMatchObject({ done: [] })
    })

    it('is possible to remove all transactions to a given end point', () => {
      const transactionA = createTransaction()
      const transactionB = createTransaction()
      const transactionC = createTransaction()

      const initialState = createState({
        done: [transactionA, transactionB, transactionC],
      })

      expect(
        transactionsReducer(
          initialState,
          clearTransactions({ fromId: transactionB.id }),
        ),
      ).toMatchObject({ done: [transactionA] })
    })
  })
})
