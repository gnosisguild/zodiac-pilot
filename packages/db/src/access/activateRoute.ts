import type { DBClient } from '../dbClient'
import { ActiveRouteTable, type Route, type Tenant, type User } from '../schema'

export const activateRoute = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  route: Route,
) => {
  const [activeRoute] = await db
    .insert(ActiveRouteTable)
    .values({
      accountId: route.toId,
      routeId: route.id,
      tenantId: tenant.id,
      userId: user.id,
    })
    .returning()

  return activeRoute
}
