import type { DBClient } from '../../dbClient'

export const getFeatures = (db: DBClient) =>
  db.query.feature.findMany({
    orderBy(fields, { asc }) {
      return asc(fields.name)
    },
  })
