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
import { Labels } from './AddressLabelContext'

type Safe = Extract<Account, { type: AccountType.SAFE }>

type Result = {
  safes: Account[]
  memberLabels: Labels
  issues: RoleDeploymentIssue[]
}

export const getMemberSafes = async (role: Role): Promise<Result> => {
  const members = await getRoleMembers(dbClient(), { roleId: role.id })

  if (members.length === 0) {
    return {
      safes: [],
      memberLabels: {},
      issues: [RoleDeploymentIssue.NoActiveMembers],
    }
  }

  const accounts = await getActivatedAccounts(dbClient(), { roleId: role.id })

  if (accounts.length === 0) {
    return {
      safes: [],
      memberLabels: {},
      issues: [RoleDeploymentIssue.NoActiveAccounts],
    }
  }

  const activeChains = Array.from(
    new Set(accounts.map((account) => account.chainId)),
  )

  const safes: Account[] = []
  const memberLabels: Labels = {}
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

      memberLabels[safe.address] = member.fullName
      memberLabels[defaultWallets[chainId].address] =
        defaultWallets[chainId].label

      if (existingSafe == null) {
        safes.push(safe)
      } else {
        safes.push(existingSafe)
      }
    }
  }

  return { safes, memberLabels, issues }
}
