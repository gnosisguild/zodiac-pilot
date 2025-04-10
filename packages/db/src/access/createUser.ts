import type { DBClient } from '../dbClient'
import { UserTable } from '../schema'

export const createUser = async (db: DBClient) => {
  const [user] = await db.insert(UserTable).values({}).returning()

  return user
}
