import type { DBClient } from '../dbClient'
import { ActiveRouteTable, type Route, type User } from '../schema'

export const activateRoute = async (db: DBClient, user: User, route: Route) => {
  const [activeRoute] = await db
    .insert(ActiveRouteTable)
    .values({
      accountId: route.toId,
      routeId: route.id,
      tenantId: user.tenantId,
      userId: user.id,
    })
    .returning()

  return activeRoute
}
