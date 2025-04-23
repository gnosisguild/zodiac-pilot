import type { Account } from '@/companion'
import type { RemoteAccount } from './TaggedAccount'

export const toRemoteAccount = (account: Account): RemoteAccount => ({
  ...account,
  remote: true,
})
