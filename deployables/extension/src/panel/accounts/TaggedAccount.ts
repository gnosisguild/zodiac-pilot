import type { Account } from '@/companion'

export type LocalAccount = Account & { remote: false }
export type RemoteAccount = Account & { remote: true }

export type TaggedAccount = LocalAccount | RemoteAccount
