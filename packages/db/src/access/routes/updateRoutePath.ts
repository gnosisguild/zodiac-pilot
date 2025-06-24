import { RouteTable } from '@zodiac/db/schema'
import type { Waypoints } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type UpdateRoutePathOptions = {
  walletId: UUID
  waypoints: Waypoints
}

export const updateRoutePath = (
  db: DBClient,
  routeId: UUID,
  { walletId, waypoints }: UpdateRoutePathOptions,
) =>
  db
    .update(RouteTable)
    .set({ fromId: walletId, waypoints })
    .where(eq(RouteTable.id, routeId))
