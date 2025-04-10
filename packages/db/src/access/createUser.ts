import { UserTable } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'

export const createUser = async (db: DBClient) => {
  const [user] = await db.insert(UserTable).values({}).returning()

  return user
}
