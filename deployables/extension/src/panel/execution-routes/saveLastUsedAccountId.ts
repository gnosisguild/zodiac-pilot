import { saveStorageEntry } from '../utils'

export const saveLastUsedAccountId = (accountId: string | null) =>
  saveStorageEntry({ key: 'lastUsedRoute', value: accountId })
