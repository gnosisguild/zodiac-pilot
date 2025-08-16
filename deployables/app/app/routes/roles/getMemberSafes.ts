import { ChainId } from '@zodiac/chains'
import { dbClient, getDefaultWallets, getRoleMembers } from '@zodiac/db'
import { UUID } from 'crypto'
import {
  Account,
  AccountType,
  queryAccounts,
  withPredictedAddress,
} from 'ser-kit'
import { Labels } from './AddressLabelContext'
import { Issue } from './issues'

type Safe = Extract<Account, { type: AccountType.SAFE }>

type Result = {
  newSafes: Account[]
  allSafes: Account[]
  labels: Labels
  issues: Issue[]
}

export const getMemberSafes = async (
  roleId: UUID,
  activeChains: ChainId[],
): Promise<Result> => {
  const members = await getRoleMembers(dbClient(), { roleId })

  const newSafes: Account[] = []
  const allSafes: Account[] = []

  const labels: Labels = {}

  if (members.length === 0) {
    return {
      allSafes: [],
      labels: {},
      newSafes: [],
      issues: [Issue.NoActiveMembers],
    }
  }

  const issues: Issue[] = []

  for (const member of members) {
    const defaultWallets = await getDefaultWallets(dbClient(), member.id)

    for (const chainId of activeChains) {
      if (defaultWallets[chainId] == null) {
        if (!issues.includes(Issue.MissingDefaultWallet)) {
          issues.push(Issue.MissingDefaultWallet)
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

      labels[safe.address] = member.fullName
      labels[defaultWallets[chainId].address] = defaultWallets[chainId].label

      if (existingSafe == null) {
        newSafes.push(safe)
      }

      allSafes.push(safe)
    }
  }

  return { newSafes, allSafes, labels, issues }
}
