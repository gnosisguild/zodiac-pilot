import { removeStorageEntry } from '@/storage'

export const clearPersistedTransactionState = () =>
  removeStorageEntry({ key: 'transactionState' })
