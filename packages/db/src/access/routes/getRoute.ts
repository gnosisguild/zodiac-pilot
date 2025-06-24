import { invariant } from '@epic-web/invariant'
import { waypointsSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getRoute = async (db: DBClient, routeId: UUID) => {
  const route = await db.query.route.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, routeId)
    },
    with: {
      wallet: true,
    },
  })

  invariant(route != null, `Could not find route with id "${routeId}"`)

  return { ...route, waypoints: waypointsSchema.parse(route.waypoints) }
}
