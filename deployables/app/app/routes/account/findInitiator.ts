import { dbClient, findActiveRoute } from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import { addressSchema, type HexAddress } from '@zodiac/schema'
import type { UUID } from 'crypto'

export const findInitiator = async (
  tenant: Tenant,
  user: User,
  accountId: UUID,
  searchParams: URLSearchParams,
): Promise<HexAddress | null> => {
  if (searchParams.has('initiator')) {
    const initiator = searchParams.get('initiator')

    if (initiator === '') {
      return null
    }

    const address = addressSchema.parse(initiator)

    return address
  }

  const activeRoute = await findActiveRoute(dbClient(), tenant, user, accountId)

  if (activeRoute == null) {
    return null
  }

  return activeRoute.route.wallet.address
}
