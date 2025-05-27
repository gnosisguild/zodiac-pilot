import { removeStorageEntry } from '@/storage'

export const clearLastTransactionExecuted = () =>
  removeStorageEntry({ key: 'lastTransactionExecutedAt' })
