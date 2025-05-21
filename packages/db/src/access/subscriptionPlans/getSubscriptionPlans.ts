import type { DBClient } from '../../dbClient'

export const getSubscriptionPlans = (db: DBClient) =>
  db.query.subscriptionPlans.findMany({
    where(fields, { eq }) {
      return eq(fields.deleted, false)
    },
    orderBy(fields, { asc }) {
      return asc(fields.name)
    },
  })
