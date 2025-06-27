import { dbClient, getAccountsByAddress, getActivePlan } from '@zodiac/db'
import type { SubscriptionPlan } from '@zodiac/db/schema'
import { verifyPrefixedAddress } from '@zodiac/schema'
import type { Route } from './+types/get-plan'

export const loader = async ({
  params: { prefixedAddress },
}: Route.LoaderArgs) => {
  const accounts = await getAccountsByAddress(
    dbClient(),
    verifyPrefixedAddress(prefixedAddress),
  )
  const activePlans = await Promise.all(
    accounts.map((account) => getActivePlan(dbClient(), account.tenantId)),
  )

  const highestPlan = activePlans.reduce<SubscriptionPlan | null>(
    (result, plan) => {
      if (result == null) {
        return plan
      }

      if (plan.priority > result.priority) {
        return plan
      }

      return result
    },
    null,
  )

  if (highestPlan == null) {
    return { currentPlan: 'none' }
  }

  return { currentPlan: highestPlan.name }
}
