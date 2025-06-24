import { RouteTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const updateRouteLabel = (db: DBClient, routeId: UUID, label: string) =>
  db.update(RouteTable).set({ label }).where(eq(RouteTable.id, routeId))
