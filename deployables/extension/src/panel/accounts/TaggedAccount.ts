import type { PartialLocalAccount, PartialRemoteAccount } from '@/companion'

export type LocalAccount = PartialLocalAccount & { remote: false }
export type RemoteAccount = PartialRemoteAccount & { remote: true }

export type TaggedAccount = LocalAccount | RemoteAccount
