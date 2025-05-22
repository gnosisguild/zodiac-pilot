import { dbClient, getAccountsByAddress, getActivePlan } from '@zodiac/db'
import type { SubscriptionPlan } from '@zodiac/db/schema'
import { getString } from '@zodiac/form-data'
import { verifyPrefixedAddress } from '@zodiac/schema'
import type { Route } from './+types/get-plan'

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData()

  const prefixedAddress = verifyPrefixedAddress(getString(data, 'address'))

  const accounts = await getAccountsByAddress(dbClient(), prefixedAddress)
  const activePlans = await Promise.all(
    accounts.map((account) => getActivePlan(dbClient(), account.tenantId)),
  )

  const highestPlan = activePlans.reduce<SubscriptionPlan | null>(
    (result, plan) => {
      if (result != null && plan.priority > result.priority) {
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
