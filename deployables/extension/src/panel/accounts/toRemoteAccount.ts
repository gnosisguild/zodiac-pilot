import type { Account } from '@/companion'
import { invariant } from '@epic-web/invariant'
import { isUUID } from '@zodiac/schema'
import type { RemoteAccount } from './TaggedAccount'

export const toRemoteAccount = ({ id, ...account }: Account): RemoteAccount => {
  invariant(isUUID(id), 'remote accounts must have UUID ids')
  invariant(
    'workspaceId' in account,
    'remote account must specify a workspace id',
  )

  return {
    ...account,
    id,
    remote: true,
  }
}
