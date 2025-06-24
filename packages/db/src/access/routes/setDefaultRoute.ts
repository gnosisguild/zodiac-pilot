import {
  DefaultRouteTable,
  type Route,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

export const setDefaultRoute = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  route: Route,
) => {
  const [defaultRoute] = await db
    .insert(DefaultRouteTable)
    .values({
      accountId: route.toId,
      routeId: route.id,
      tenantId: tenant.id,
      userId: user.id,
    })
    .returning()

  return defaultRoute
}
