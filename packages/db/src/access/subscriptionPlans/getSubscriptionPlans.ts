import type { DBClient } from '../../dbClient'

export const getSubscriptionPlans = async (db: DBClient) =>
  db.query.subscriptionPlans.findMany({
    where(fields, { eq }) {
      return eq(fields.deleted, false)
    },
    orderBy(fields, { asc, desc }) {
      return [desc(fields.priority), asc(fields.name)]
    },
  })
