import { saveStorageEntry } from '@/storage'
import type { State } from './state'

export const persistTransactionState = (state: State) =>
  saveStorageEntry({ key: 'transactionState', value: state })
