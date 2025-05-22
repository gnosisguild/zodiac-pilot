import type { User } from '@workos-inc/node'
import { createUser, findUserByExternalId, type DBClient } from '@zodiac/db'

export const upsertUser = async (db: DBClient, workOSUser: User) => {
  const existingUser = await findUserByExternalId(db, workOSUser.id)

  if (existingUser != null) {
    return existingUser
  }

  return createUser(db, {
    fullName: `${workOSUser.firstName} ${workOSUser.lastName}`,
    externalId: workOSUser.id,
  })
}
