import { faker } from '@faker-js/faker'
import {
  SubscriptionPlanTable,
  type SubscriptionPlan,
  type SubscriptionPlanCreateInput,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const subscriptionPlanFactory = createFactory<
  SubscriptionPlanCreateInput,
  SubscriptionPlan
>({
  build(data) {
    return {
      name: faker.company.buzzNoun(),

      ...data,
    }
  },
  async create(db, data) {
    const [subscriptionPlan] = await db
      .insert(SubscriptionPlanTable)
      .values(data)
      .returning()

    return subscriptionPlan
  },
  createWithoutDb(input) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      deleted: false,
      deletedAt: null,
      deletedById: null,

      ...input,
    }
  },
})
