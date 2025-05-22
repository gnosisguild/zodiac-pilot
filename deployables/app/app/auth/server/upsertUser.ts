import type { User } from '@workos-inc/node'
import {
  createUser,
  findUserByExternalId,
  updateUser,
  type DBClient,
} from '@zodiac/db'

export const upsertUser = async (db: DBClient, workOSUser: User) => {
  const existingUser = await findUserByExternalId(db, workOSUser.id)

  if (existingUser != null) {
    const fullName =
      `${workOSUser.firstName ?? ''} ${workOSUser.lastName ?? ''}`.trim()

    if (fullName === existingUser.fullName) {
      return existingUser
    }

    return updateUser(db, existingUser.id, { fullName })
  }

  return createUser(db, {
    fullName: `${workOSUser.firstName} ${workOSUser.lastName}`,
    externalId: workOSUser.id,
  })
}
