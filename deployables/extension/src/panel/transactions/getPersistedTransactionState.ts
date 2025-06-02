import { getStorageEntry } from '@/storage'
import type { State } from './state'

export const getPersistedTransactionState = () =>
  getStorageEntry<State>({ key: 'transactionState' })
