import { createConfirmedTransaction, createTransaction } from '@/test-utils'
import { createMockTransactionRequest } from '@zodiac/test-utils'
import { addMinutes } from 'date-fns'
import { describe, expect, it } from 'vitest'
import {
  appendTransaction,
  clearTransactions,
  commitRefreshTransactions,
  confirmRollbackTransaction,
  confirmTransaction,
  failTransaction,
  finishTransaction,
  refreshTransactions,
  revertTransaction,
  rollbackTransaction,
  translateTransaction,
} from './actions'
import { transactionsReducer, type State } from './reducer'

describe('Transactions reducer', () => {
  const createState = (initialState: Partial<State> = {}): State => ({
    pending: [],
    confirmed: [],
    done: [],
    failed: [],
    reverted: [],

    rollback: null,
    refresh: false,

    ...initialState,
  })

  describe('Append', () => {
    it('adds a transaction to the pending queue', () => {
      const transaction = createMockTransactionRequest()

      expect(
        transactionsReducer(createState(), appendTransaction({ transaction })),
      ).toMatchObject({
        pending: [expect.objectContaining(transaction)],
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

  describe('Rollback', () => {
    it('is possible to confirm a rollback', () => {
      const transaction = createConfirmedTransaction()

      expect(
        transactionsReducer(
          createState({ rollback: transaction }),
          confirmRollbackTransaction({ id: transaction.id }),
        ),
      ).toMatchObject({ rollback: null })
    })

    describe('Successful transaction', () => {
      it('puts a transaction into the rollback state', () => {
        const transaction = createConfirmedTransaction()

        expect(
          transactionsReducer(
            createState({ done: [transaction] }),
            rollbackTransaction({ id: transaction.id }),
          ),
        ).toMatchObject({ rollback: transaction, done: [] })
      })

      it('puts all transaction that came after the one that was rolled back into pending state', () => {
        const transactionA = createConfirmedTransaction()
        const transactionB = createConfirmedTransaction()

        const initialState = createState({ done: [transactionA, transactionB] })

        expect(
          transactionsReducer(
            initialState,
            rollbackTransaction({ id: transactionA.id }),
          ),
        ).toMatchObject({
          rollback: transactionA,
          pending: [transactionB],
          done: [],
        })
      })
    })

    describe('Failed transaction', () => {
      it('puts a transaction into the rollback state', () => {
        const transaction = createConfirmedTransaction()

        expect(
          transactionsReducer(
            createState({ failed: [transaction] }),
            rollbackTransaction({ id: transaction.id }),
          ),
        ).toMatchObject({ rollback: transaction, failed: [] })
      })

      it('puts all transaction that came after the one that was rolled back into pending state', () => {
        const transactionA = createConfirmedTransaction()
        const transactionB = createConfirmedTransaction()

        const initialState = createState({
          failed: [transactionA, transactionB],
        })

        expect(
          transactionsReducer(
            initialState,
            rollbackTransaction({ id: transactionA.id }),
          ),
        ).toMatchObject({
          rollback: transactionA,
          pending: [transactionB],
          failed: [],
        })
      })
    })
  })

  describe('Refresh', () => {
    it('puts all transactions into pending state sorted by date', () => {
      const now = new Date()

      const transactionA = createConfirmedTransaction({ createdAt: now })
      const transactionB = createConfirmedTransaction({
        createdAt: addMinutes(now, 1),
      })
      const transactionC = createConfirmedTransaction({
        createdAt: addMinutes(now, 2),
      })
      const transactionD = createConfirmedTransaction({
        createdAt: addMinutes(now, 3),
      })

      const initialState = createState({
        done: [transactionA],
        failed: [transactionB],
        confirmed: [transactionC],
        reverted: [transactionD],
      })

      expect(
        transactionsReducer(initialState, refreshTransactions()),
      ).toMatchObject({
        pending: [transactionA, transactionB, transactionC, transactionD],

        done: [],
        failed: [],
        confirmed: [],
        reverted: [],
      })
    })

    it('sets the refresh flag', () => {
      expect(
        transactionsReducer(createState(), refreshTransactions()),
      ).toMatchObject({ refresh: true })
    })

    it('is possible to commit a refresh', () => {
      expect(
        transactionsReducer(
          createState({ refresh: true }),
          commitRefreshTransactions(),
        ),
      ).toMatchObject({ refresh: false })
    })
  })

  describe('Apply translation', () => {
    it('enqueues all new transactions and rolls back the current transaction being translated', () => {
      const transactionA = createConfirmedTransaction()
      const transactionB = createConfirmedTransaction()

      const translation = createMockTransactionRequest()

      const initialState = createState({ done: [transactionA, transactionB] })

      expect(
        transactionsReducer(
          initialState,
          translateTransaction({
            id: transactionA.id,
            translations: [translation],
          }),
        ),
      ).toMatchObject({
        rollback: transactionA,
        pending: [expect.objectContaining(translation), transactionB],
      })
    })

    it.todo('apply global translation')
  })
})
