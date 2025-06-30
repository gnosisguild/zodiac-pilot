import { getRemoteRoutes, type FetchOptions } from '@/companion'
import { isUUID } from '@zodiac/schema'
import type { UUID } from 'crypto'

export const getRoutes = async (
  accountId: UUID | string,
  options: FetchOptions,
) => {
  if (isUUID(accountId)) {
    return getRemoteRoutes(accountId, options)
  }

  return []
}
