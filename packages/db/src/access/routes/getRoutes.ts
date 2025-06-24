import { waypointsSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetRoutesOptions = {
  walletId?: UUID
  accountId: UUID
}

export const getRoutes = async (
  db: DBClient,
  tenantId: UUID,
  { walletId, accountId }: GetRoutesOptions,
) => {
  const routes = await db.query.route.findMany({
    where(fields, { eq, and }) {
      let where = and(eq(fields.tenantId, tenantId), eq(fields.toId, accountId))

      if (walletId != null) {
        where = and(where, eq(fields.fromId, walletId))
      }

      return where
    },
  })

  return routes.map((route) => ({
    ...route,
    waypoints: waypointsSchema.parse(route.waypoints),
  }))
}
