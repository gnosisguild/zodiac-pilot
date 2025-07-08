import type { Account } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
type PartialAccount = Pick<Account, 'label' | 'address' | 'chainId'> & {
  id: UUID | string
}

export type PartialLocalAccount = PartialAccount & { id: string }
export type PartialRemoteAccount = PartialAccount & {
  id: UUID
  workspaceId: UUID
}

export type CompanionAccount = PartialLocalAccount | PartialRemoteAccount
