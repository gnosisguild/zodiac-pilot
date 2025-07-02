import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getLastRoutesUpdateTime = async (db: DBClient, tenantId: UUID) => {
  const lastUpdatedRoute = await db.query.route.findFirst({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
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
