import type { Account } from '@/companion'
import type { LocalAccount } from './TaggedAccount'

export const toLocalAccount = (account: Account): LocalAccount => ({
  ...account,
  remote: false,
})
