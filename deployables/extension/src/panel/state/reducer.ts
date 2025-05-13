import { invariant } from '@epic-web/invariant'
import type { MetaTransactionRequest } from 'ser-kit'
import type { ContractInfo } from '../utils/abi'
import { Action, type TransactionAction } from './actions'

export type Transaction = MetaTransactionRequest & {
  id: string
  createdAt: Date
  snapshotId?: string
  contractInfo?: ContractInfo
  transactionHash?: string
}

export type State = {
  pending: Transaction[]
  done: Transaction[]
  failed: Transaction[]
  reverted: Transaction[]
}

export const transactionsReducer = (
  state: State,
  { type, payload }: TransactionAction,
): State => {
  switch (type) {
    case Action.Append: {
      const { id, transaction } = payload

      return {
        ...state,

        pending: [
          ...state.pending,
          { ...transaction, id, createdAt: new Date() },
        ],
      }
    }

    case Action.Decode: {
      const { id, contractInfo } = payload

      return {
        ...state,

        pending: decodeTransaction(state.pending, id, contractInfo),
        done: decodeTransaction(state.done, id, contractInfo),
      }
    }

    case Action.Confirm: {
      const { id, snapshotId, transactionHash } = payload

      return {
        ...state,

        pending: state.pending.map((transaction) =>
          transaction.id === id
            ? { ...transaction, snapshotId, transactionHash }
            : transaction,
        ),
      }
    }

    case Action.Remove: {
      const { id } = payload

      return {
        ...state,

        done: removeTransaction(state.done, id),
        pending: removeTransaction(state.pending, id),
        failed: removeTransaction(state.failed, id),
        reverted: removeTransaction(state.reverted, id),
      }
    }

    case Action.Clear: {
      if (payload == null) {
        return {
          pending: [],
          done: [],
          failed: [],
          reverted: [],
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

      const transaction = getTransaction(state.pending, id)

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        failed: [...state.failed, transaction],
      }
    }

    case Action.Finish: {
      const { id } = payload

      const transaction = getTransaction(state.pending, id)

      return {
        ...state,

        pending: removeTransaction(state.pending, id),
        done: [...state.done, transaction],
      }
    }

    case Action.Revert: {
      const { id } = payload

      const transaction = getTransaction(state.pending, id)

      return {
        ...state,
        pending: removeTransaction(state.pending, id),
        reverted: [...state.reverted, transaction],
      }
    }
  }
}

const decodeTransaction = (
  transactions: Transaction[],
  id: string,
  contractInfo: ContractInfo,
) =>
  transactions.map((transaction) =>
    transaction.id === id ? { ...transaction, contractInfo } : transaction,
  )

const removeTransaction = (transactions: Transaction[], id: string) =>
  transactions.filter((transaction) => transaction.id !== id)

const getTransaction = (transactions: Transaction[], id: string) => {
  const transaction = transactions.find((transaction) => transaction.id === id)

  invariant(transaction != null, `Could not find transaction with id "${id}"`)

  return transaction
}
