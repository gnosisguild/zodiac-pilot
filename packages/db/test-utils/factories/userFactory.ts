import { faker } from '@faker-js/faker'
import { UserTable, type User, type UserCreateInput } from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import randomBigInt from 'crypto-random-bigint'
import { createFactory } from './createFactory'

export const userFactory = createFactory<UserCreateInput, User>({
  build(data) {
    return {
      fullName: faker.person.fullName(),
      externalId: randomUUID(),

      ...data,
    }
  },
  async create(db, data) {
    const [user] = await db.insert(UserTable).values(data).returning()

    return user
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      fullName: faker.person.fullName(),
      externalId: randomUUID(),
      updatedAt: null,
      nonce: randomBigInt(128),

      ...data,
    }
  },
})
