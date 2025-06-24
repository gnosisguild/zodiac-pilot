import { RouteTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const removeRoute = (db: DBClient, routeId: UUID) =>
  db.delete(RouteTable).where(eq(RouteTable.id, routeId))
