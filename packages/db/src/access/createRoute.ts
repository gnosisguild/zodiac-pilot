import { RouteTable, type Account, type Wallet } from '@zodiac/db/schema'
import type { Waypoints } from '@zodiac/schema'
import type { DBClient } from '../dbClient'

type CreateRouteOptions = {
  waypoints?: Waypoints
}

export const createRoute = async (
  db: DBClient,
  wallet: Wallet,
  account: Account,
  { waypoints }: CreateRouteOptions = {},
) => {
  const [route] = await db
    .insert(RouteTable)
    .values({
      fromId: wallet.id,
      toId: account.id,
      tenantId: account.tenantId,
      waypoints,
    })
    .returning()

  return route
}
