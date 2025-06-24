import type { Tenant, User } from '@zodiac/db/schema'
import { waypointsSchema } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const findDefaultRoute = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: UUID,
) => {
  const defaultRoute = await db.query.defaultRoute.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.tenantId, tenant.id),
        eq(fields.userId, user.id),
        eq(fields.accountId, accountId),
      )
    },
    with: {
      account: true,
      route: {
        with: {
          wallet: true,
        },
      },
    },
  })

  if (defaultRoute == null) {
    return defaultRoute
  }

  return {
    ...defaultRoute,
    route: {
      ...defaultRoute.route,
      waypoints:
        defaultRoute.route.waypoints == null
          ? defaultRoute.route.waypoints
          : waypointsSchema.parse(defaultRoute.route.waypoints),
    },
  } satisfies typeof defaultRoute
}
