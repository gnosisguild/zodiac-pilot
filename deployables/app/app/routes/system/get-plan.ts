import { dbClient, getAccountsByAddress, getActivePlan } from '@zodiac/db'
import type { SubscriptionPlan } from '@zodiac/db/schema'
import { verifyPrefixedAddress } from '@zodiac/schema'
import type { Route } from './+types/get-plan'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const address = url.searchParams.get('address')

  if (!address) {
    throw new Response('Address parameter is required', { status: 400 })
  }

  const prefixedAddress = verifyPrefixedAddress(address)

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
