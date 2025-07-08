import type { PartialLocalAccount, PartialRemoteAccount } from '@/companion'
import type { UUID } from 'crypto'

export type LocalAccount = PartialLocalAccount & { remote: false }
export type RemoteAccount = PartialRemoteAccount & {
  remote: true
  workspaceId: UUID
}

export type TaggedAccount = LocalAccount | RemoteAccount
