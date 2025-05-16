import { saveStorageEntry } from '@/storage'

export const saveLastUsedAccountId = (accountId: string | null) =>
  saveStorageEntry({ key: 'lastUsedRoute', value: accountId })
