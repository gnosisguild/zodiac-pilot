import { dbClient, getRole } from '@zodiac/db'
import { StepsByAccount } from '@zodiac/db/schema'
import { HexAddress } from '@zodiac/schema'
import { UUID } from 'crypto'
import {
  AccountBuilderResult,
  planApplyAccounts,
  resolveAccounts,
} from 'ser-kit'
import { getMemberSafes } from './getMemberSafes'
import { getRolesMods } from './getRolesMods'

export const planRoleUpdate = async (roleId: UUID) => {
  const role = await getRole(dbClient(), roleId)

  const { safes, issues: memberIssues } = await getMemberSafes(role)
  const resolvedSafes = await resolveAccounts({
    updatesOrCreations: safes,
    accountForSetup: user.personalSafe,
  })

  const { rolesMods, issues: roleIssues } = await getRolesMods(role, {
    members: resolvedSafes.desired,
  })

  const resolvedRolesMods = await resolveAccounts({
    updatesOrCreations: rolesMods,
  })

  const result = await planApplyAccounts({
    current: [...resolvedSafes.current, ...resolvedRolesMods.current],
    desired: [...resolvedSafes.desired, ...resolvedRolesMods.desired],
    accountForSetup: user.personalSafe,
  })

  return {
    issues: [...roleIssues, ...memberIssues],
    slices: groupByFrom(result, user.personalSafe),
  }
}

const groupByFrom = (
  accountBuilderResults: AccountBuilderResult,
  accountForSetup: HexAddress,
): { from: HexAddress; steps: StepsByAccount[] }[] => {
  const ANYONE = 'ANYONE'
  const { [ANYONE]: stepsFromAnyone, ...stepsByFrom } = groupBy(
    accountBuilderResults,
    (step) => step.from ?? ANYONE,
  )
  // include steps without a `from` in the first group
  const firstGroup = Object.values(stepsByFrom)[0]

  if (firstGroup == null) {
    // all steps can be executed by anyone – use specified accountForSetup
    return [
      {
        from: accountForSetup,
        steps: stepsFromAnyone,
      },
    ]
  }

  firstGroup.unshift(...stepsFromAnyone)
  return Object.entries(stepsByFrom).map(([from, steps]) => ({
    from: from as HexAddress,
    steps,
  }))
}

/**
 * Groups an array of items by a key extracted from each item
 * @param array - The array to group
 * @param keySelector - Function that extracts the key from each item
 * @returns An object where keys are the extracted values and values are arrays of items
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keySelector: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keySelector(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)

      return groups
    },
    {} as Record<K, T[]>,
  )
}
