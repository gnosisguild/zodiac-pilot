import { waypointsSchema } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import type { Tenant, User } from '../schema'

export const findActiveRoute = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: string,
) => {
  const activeRoute = await db.query.activeRoute.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.tenantId, tenant.id),
        eq(fields.userId, user.id),
        eq(fields.accountId, accountId),
      )
    },
    with: {
      route: {
        with: {
          wallet: true,
        },
      },
    },
  })

  if (activeRoute == null) {
    return activeRoute
  }

  return {
    ...activeRoute,
    route: {
      ...activeRoute.route,
      waypoints:
        activeRoute.route.waypoints == null
          ? activeRoute.route.waypoints
          : waypointsSchema.parse(activeRoute.route.waypoints),
    },
  } satisfies typeof activeRoute
}
