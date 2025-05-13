import { createConfirmedTransaction, createTransaction } from '@/test-utils'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { describe, expect, it } from 'vitest'
import {
  appendTransaction,
  clearTransactions,
  confirmTransaction,
  failTransaction,
  finishTransaction,
  revertTransaction,
} from './actions'
import { transactionsReducer, type State } from './reducer'

describe('Transactions reducer', () => {
  const createState = (initialState: Partial<State> = {}): State => ({
    pending: [],
    confirmed: [],
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

  describe('Confirm', () => {
    it('moves a transaction from the pending to the confirmed state', () => {
      const transaction = createTransaction()

      expect(
        transactionsReducer(
          createState({ pending: [transaction] }),
          confirmTransaction({
            id: transaction.id,
            snapshotId: 'test',
            transactionHash: 'test',
          }),
        ),
      ).toMatchObject({
        pending: [],
        confirmed: [
          { ...transaction, snapshotId: 'test', transactionHash: 'test' },
        ],
      })
    })
  })

  describe('Clear', () => {
    it('is possible to remove all transactions', () => {
      const initialState = createState({
        done: [createConfirmedTransaction(), createConfirmedTransaction()],
      })

      expect(
        transactionsReducer(initialState, clearTransactions()),
      ).toMatchObject({ done: [] })
    })

    it('is possible to remove all transactions to a given end point', () => {
      const transactionA = createConfirmedTransaction()
      const transactionB = createConfirmedTransaction()
      const transactionC = createConfirmedTransaction()

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

  describe('Failure', () => {
    it('moves a transaction from the pending state into the failed state', () => {
      const transaction = createConfirmedTransaction()

      expect(
        transactionsReducer(
          createState({ confirmed: [transaction] }),
          failTransaction({ id: transaction.id }),
        ),
      ).toMatchObject({ pending: [], failed: [transaction] })
    })
  })

  describe('Success', () => {
    it('moves a transaction from the pending state to the done state', () => {
      const transaction = createConfirmedTransaction()

      expect(
        transactionsReducer(
          createState({ confirmed: [transaction] }),
          finishTransaction({ id: transaction.id }),
        ),
      ).toMatchObject({
        pending: [],
        done: [transaction],
      })
    })
  })

  describe('Revert', () => {
    it('moves a transaction from the pending to the reverted state', () => {
      const transaction = createConfirmedTransaction()

      expect(
        transactionsReducer(
          createState({ confirmed: [transaction] }),
          revertTransaction({ id: transaction.id }),
        ),
      ).toMatchObject({ pending: [], reverted: [transaction] })
    })
  })
})
