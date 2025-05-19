import { updateExternalUserId } from '@/workOS/server'
import { invariant } from '@epic-web/invariant'
import type { User } from '@workos-inc/node'
import { createUser, getUser, type DBClient } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'

export const upsertUser = async (db: DBClient, workOSUser: User) => {
  if (workOSUser.externalId == null) {
    const user = await createUser(db)

    await updateExternalUserId({
      userId: workOSUser.id,
      externalId: user.id,
    })

    return user
  }

  invariant(isUUID(workOSUser.externalId), '"externalId" is not a UUID')

  return getUser(db, workOSUser.externalId)
}
