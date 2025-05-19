import { getStorageEntry } from '@/storage'

export const getLastTransactionExecutedAt = () =>
  getStorageEntry<string>({ key: 'lastTransactionExecutedAt' })
