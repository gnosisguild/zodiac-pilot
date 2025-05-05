import { RouteTable } from '@zodiac/db/schema'
import type { Waypoints } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../dbClient'

type CreateRouteOptions = {
  walletId: UUID
  accountId: UUID
  waypoints: Waypoints
}

export const createRoute = async (
  db: DBClient,
  tenantId: UUID,
  { waypoints, walletId, accountId }: CreateRouteOptions,
) => {
  const [route] = await db
    .insert(RouteTable)
    .values({
      fromId: walletId,
      toId: accountId,
      tenantId: tenantId,
      waypoints,
    })
    .returning()

  return route
}
