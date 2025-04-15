import type { Account } from '@/companion'

export const sortAccounts = (accountA: Account, accountB: Account) => {
  if (accountA.label == null && accountB.label == null) {
    return 0
  }

  if (accountA.label == null) {
    return -1
  }

  if (accountB.label == null) {
    return 1
  }

  return accountA.label.localeCompare(accountB.label)
}
