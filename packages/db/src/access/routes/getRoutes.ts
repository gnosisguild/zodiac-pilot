import { waypointsSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type GetRoutesOptions = {
  walletId?: UUID
  userId: UUID
  accountId: UUID
}

export const getRoutes = async (
  db: DBClient,
  tenantId: UUID,
  { walletId, accountId, userId }: GetRoutesOptions,
) => {
  const routes = await db.query.route.findMany({
    where(fields, { eq, and }) {
      let where = and(eq(fields.tenantId, tenantId), eq(fields.toId, accountId))

      if (walletId != null) {
        where = and(where, eq(fields.fromId, walletId))
      }

      if (userId != null) {
        where = and(where, eq(fields.userId, userId))
      }

      return where
    },
    orderBy(fields, { asc, desc }) {
      return [asc(fields.label), desc(fields.createdAt)]
    },
  })

  return routes.map((route) => ({
    ...route,
    waypoints: waypointsSchema.parse(route.waypoints),
  }))
}
