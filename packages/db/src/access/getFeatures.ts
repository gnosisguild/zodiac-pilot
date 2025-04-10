import type { DBClient } from '../dbClient'

export const getFeatures = async (db: DBClient, tenantId: string) => {
  const activeFeatures = await db.query.activeFeature.findMany({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
    },
    with: {
      feature: true,
    },
  })

  return activeFeatures.map(({ feature }) => feature)
}
