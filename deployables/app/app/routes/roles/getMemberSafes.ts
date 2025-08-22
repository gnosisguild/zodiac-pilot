import {
  dbClient,
  getActivatedAccounts,
  getDefaultWallets,
  getRoleMembers,
} from '@zodiac/db'
import { Role, RoleDeploymentIssue } from '@zodiac/db/schema'
import {
  Account,
  AccountType,
  queryAccounts,
  withPredictedAddress,
} from 'ser-kit'

type Safe = Extract<Account, { type: AccountType.SAFE }>

type Result = {
  safes: Account[]
  issues: RoleDeploymentIssue[]
}

export const getMemberSafes = async (role: Role): Promise<Result> => {
  const members = await getRoleMembers(dbClient(), { roleId: role.id })

  if (members.length === 0) {
    return {
      safes: [],
      issues: [RoleDeploymentIssue.NoActiveMembers],
    }
  }

  const accounts = await getActivatedAccounts(dbClient(), { roleId: role.id })

  if (accounts.length === 0) {
    return {
      safes: [],
      issues: [RoleDeploymentIssue.NoActiveAccounts],
    }
  }

  const activeChains = Array.from(
    new Set(accounts.map((account) => account.chainId)),
  )

  const safes: Account[] = []
  const issues: RoleDeploymentIssue[] = []

  for (const member of members) {
    const defaultWallets = await getDefaultWallets(dbClient(), member.id)

    for (const chainId of activeChains) {
      if (defaultWallets[chainId] == null) {
        if (!issues.includes(RoleDeploymentIssue.MissingDefaultWallet)) {
          issues.push(RoleDeploymentIssue.MissingDefaultWallet)
        }

        continue
      }

      const safe = withPredictedAddress<Safe>(
        {
          type: AccountType.SAFE,
          chain: chainId,
          modules: [],
          owners: [defaultWallets[chainId].address],
          threshold: 1,
        },
        member.nonce,
      )

      const [existingSafe] = await queryAccounts([safe.prefixedAddress])

      if (existingSafe == null) {
        safes.push(safe)
      } else {
        safes.push(existingSafe)
      }
    }
  }

  return { safes, issues }
}
