import { invariant } from '@epic-web/invariant'
import { metaTransactionRequestEqual } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import type { MetaTransactionRequest } from 'ser-kit'
import { Action, type TransactionAction } from './actions'
import { ExecutionStatus } from './executionStatus'
import type {
  ContractInfo,
  State,
  Transaction,
  UnconfirmedTransaction,
} from './state'

export const transactionsReducer = (
  state: State,
  { type, payload }: TransactionAction,
): State => {
  switch (type) {
    case Action.Append: {
      const { transaction } = payload

      return {
        ...state,

        pending: [...state.pending, createTransaction(transaction)],
      }
    }

    case Action.Decode: {
      const { id, contractInfo } = payload

      return {
        ...state,

        pending: decodeTransaction(state.pending, id, contractInfo),
        executed: decodeTransaction(state.executed, id, contractInfo),
      }
    }

    case Action.Confirm: {
      const { id, snapshotId, transactionHash } = payload

      const transaction = getTransaction(state.pending, id)

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        executed: [
          ...state.executed,
          {
            ...transaction,
            snapshotId,
            transactionHash,
            status: ExecutionStatus.CONFIRMED,
          },
        ],
      }
    }

    case Action.Remove: {
      const { id } = payload

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        executed: removeTransaction(state.executed, id),
      }
    }

    case Action.Clear: {
      if (payload == null) {
        return {
          pending: [],
          executed: [],

          rollback: null,
          refresh: false,
        }
      }

      const { fromId } = payload
      const index = state.executed.findIndex((item) => item.id === fromId)

      if (index === -1) {
        return state
      }

      return { ...state, executed: state.executed.slice(0, index) }
    }

    case Action.Fail: {
      const { id } = payload

      return {
        ...state,

        executed: updateTransactionStatus(
          state.executed,
          id,
          ExecutionStatus.FAILED,
        ),
      }
    }

    case Action.Finish: {
      const { id } = payload

      return {
        ...state,

        executed: updateTransactionStatus(
          state.executed,
          id,
          ExecutionStatus.SUCCESS,
        ),
      }
    }

    case Action.Revert: {
      const { id } = payload

      return {
        ...state,

        executed: updateTransactionStatus(
          state.executed,
          id,
          ExecutionStatus.META_TRANSACTION_REVERTED,
        ),
      }
    }

    case Action.Rollback: {
      const { id } = payload

      return rollback(state, id)
    }

    case Action.ConfirmRollback: {
      const { id } = payload

      invariant(state.rollback != null, 'No transaction rollback in progress')
      invariant(
        state.rollback.id === id,
        'Confirmed rollback id does not match transaction currently being rolled back',
      )

      return {
        ...state,

        rollback: null,
      }
    }

    case Action.Translate: {
      const { id, translations } = payload

      return rollback(
        {
          ...state,
          pending: [...state.pending, ...translations.map(createTransaction)],
        },
        id,
      )
    }

    case Action.GlobalTranslate: {
      const { translations } = payload

      const firstDifferenceIndex = state.executed.findIndex(
        (tx, index) => !metaTransactionRequestEqual(tx, translations[index]),
      )

      if (
        firstDifferenceIndex === -1 &&
        translations.length === state.executed.length
      ) {
        console.warn(
          'Global translations returned the original set of transactions. It should return undefined in that case.',
        )

        return state
      }

      if (firstDifferenceIndex !== -1) {
        const updatedState = rollback(
          state,
          state.executed[firstDifferenceIndex].id,
        )

        return {
          ...updatedState,

          pending: [
            ...state.pending,
            ...translations.slice(firstDifferenceIndex).map(createTransaction),
          ],
        }
      }

      return {
        ...state,

        pending: [
          ...state.pending,
          ...translations.slice(state.executed.length).map(createTransaction),
        ],
      }
    }

    case Action.Refresh: {
      return {
        ...state,

        pending: state.executed,
        executed: [],

        refresh: true,
      }
    }

    case Action.CommitRefresh: {
      return { ...state, refresh: false }
    }
  }
}

const createTransaction = (
  transaction: MetaTransactionRequest,
): UnconfirmedTransaction => ({
  ...transaction,
  id: nanoid(),
  createdAt: new Date(),
})

const decodeTransaction = <T extends Transaction>(
  transactions: T[],
  id: string,
  contractInfo: ContractInfo,
): T[] =>
  transactions.map((transaction) =>
    transaction.id === id ? { ...transaction, contractInfo } : transaction,
  )

const removeTransaction = <T extends Transaction>(
  transactions: T[],
  id: string,
): T[] => transactions.filter((transaction) => transaction.id !== id)

const getTransaction = <T extends Transaction>(
  transactions: T[],
  id: string,
): T => {
  const transaction = findTransaction(transactions, id)

  invariant(transaction != null, `Could not find transaction with id "${id}"`)

  return transaction
}

const findTransaction = <T extends Transaction>(
  transactions: T[],
  id: string,
): T | undefined => {
  const transaction = transactions.find((transaction) => transaction.id === id)

  return transaction
}

const rollback = (state: State, id: string): State => {
  const transaction = getTransaction(state.executed, id)

  const index = state.executed.indexOf(transaction)

  return {
    ...state,

    executed: state.executed.slice(0, index),
    pending: [...state.pending, ...state.executed.slice(index + 1)],

    rollback: transaction,
  }
}

const updateTransactionStatus = <T extends Transaction>(
  transactions: T[],
  id: string,
  status: ExecutionStatus,
): T[] =>
  transactions.map((transaction) => {
    if (transaction.id === id) {
      return { ...transaction, status }
    }

    return transaction
  })
