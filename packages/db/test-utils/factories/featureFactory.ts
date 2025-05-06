import { faker } from '@faker-js/faker'
import {
  FeatureTable,
  type Feature,
  type FeatureCreateInput,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const featureFactory = createFactory<FeatureCreateInput, Feature>({
  build(data) {
    return {
      name: faker.word.noun(),

      ...data,
    }
  },
  async create(db, data) {
    const [feature] = await db.insert(FeatureTable).values(data).returning()

    return feature
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),

      ...data,
    }
  },
})
