import { SubscriptionPlanTable } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

export const createSubscriptionPlan = (db: DBClient, name: string) =>
  db.insert(SubscriptionPlanTable).values({ name })
