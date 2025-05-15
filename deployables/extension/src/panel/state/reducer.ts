import { invariant } from '@epic-web/invariant'
import { metaTransactionRequestEqual } from '@zodiac/schema'
import { nanoid } from 'nanoid'
import type { MetaTransactionRequest } from 'ser-kit'
import { Action, type TransactionAction } from './actions'
import { isConfirmedTransaction } from './isConfirmedTransaction'
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

        pending: [
          ...state.pending,
          { ...transaction, id: nanoid(), createdAt: new Date() },
        ],
      }
    }

    case Action.Decode: {
      const { id, contractInfo } = payload

      return {
        ...state,

        pending: decodeTransaction(state.pending, id, contractInfo),
        done: decodeTransaction(state.done, id, contractInfo),
        failed: decodeTransaction(state.done, id, contractInfo),
        confirmed: decodeTransaction(state.done, id, contractInfo),
        reverted: decodeTransaction(state.done, id, contractInfo),
      }
    }

    case Action.Confirm: {
      const { id, snapshotId, transactionHash } = payload

      const transaction = getTransaction(state.pending, id)

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        confirmed: [
          ...state.confirmed,
          { ...transaction, snapshotId, transactionHash },
        ],
      }
    }

    case Action.Remove: {
      const { id } = payload

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        confirmed: removeTransaction(state.confirmed, id),
        done: removeTransaction(state.done, id),
        failed: removeTransaction(state.failed, id),
        reverted: removeTransaction(state.reverted, id),
      }
    }

    case Action.Clear: {
      if (payload == null) {
        return {
          pending: [],
          confirmed: [],
          done: [],
          failed: [],
          reverted: [],

          rollback: null,
          refresh: false,
        }
      }

      const { fromId } = payload
      const index = state.done.findIndex((item) => item.id === fromId)

      if (index === -1) {
        return state
      }

      return { ...state, done: state.done.slice(0, index) }
    }

    case Action.Fail: {
      const { id } = payload

      const transaction = getTransaction(state.confirmed, id)

      return {
        ...state,

        confirmed: removeTransaction(state.confirmed, id),
        failed: [...state.failed, transaction],
      }
    }

    case Action.Finish: {
      const { id } = payload

      const transaction = getTransaction(state.confirmed, id)

      return {
        ...state,

        confirmed: removeTransaction(state.confirmed, id),
        done: [...state.done, transaction],
      }
    }

    case Action.Revert: {
      const { id } = payload

      const transaction = getTransaction(state.confirmed, id)

      return {
        ...state,

        confirmed: removeTransaction(state.confirmed, id),
        reverted: [...state.reverted, transaction],
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

      const firstDifferenceIndex = state.done.findIndex(
        (tx, index) => !metaTransactionRequestEqual(tx, translations[index]),
      )

      if (
        firstDifferenceIndex === -1 &&
        translations.length === state.done.length
      ) {
        console.warn(
          'Global translations returned the original set of transactions. It should return undefined in that case.',
        )

        return state
      }

      if (firstDifferenceIndex !== -1) {
        const updatedState = rollback(
          state,
          state.done[firstDifferenceIndex].id,
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
          ...translations.slice(state.done.length).map(createTransaction),
        ],
      }
    }

    case Action.Refresh: {
      return {
        ...state,

        pending: [
          ...state.done,
          ...state.reverted,
          ...state.failed,
          ...state.confirmed,
        ].toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),

        done: [],
        reverted: [],
        failed: [],
        confirmed: [],

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

const rollback = (
  state: State,
  id: string,
  key: keyof Omit<State, 'rollback' | 'refresh'> = 'done',
): State => {
  const transaction = findTransaction(state[key], id)

  if (transaction == null) {
    return rollback(state, id, 'failed')
  }

  invariant(
    isConfirmedTransaction(transaction),
    'Can only roll back transaction that have been confirmed before',
  )

  const index = state[key].findIndex(({ id }) => transaction.id === id)
  const invalidatedTransactions = state[key].slice(index + 1)

  return {
    ...state,

    [key]: state[key].slice(0, index),
    pending: [...state.pending, ...invalidatedTransactions],

    rollback: transaction,
  }
}
