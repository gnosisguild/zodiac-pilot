import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getLastRoutesUpdateTime = async (db: DBClient, tenantId: UUID) => {
  const lastUpdatedRoute = await db.query.route.findFirst({
    where(fields, { eq, and, isNotNull }) {
      return and(eq(fields.tenantId, tenantId), isNotNull(fields.updatedAt))
    },
    orderBy(fields, { desc }) {
      return desc(fields.updatedAt)
    },
  })

  if (lastUpdatedRoute == null) {
    return null
  }

  return lastUpdatedRoute.updatedAt
}
