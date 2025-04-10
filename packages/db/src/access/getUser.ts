import { invariant } from '@epic-web/invariant'
import type { DBClient } from '../dbClient'

export const getUser = async (db: DBClient, userId: string) => {
  const user = await db.query.user.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId)
    },
  })

  invariant(user != null, `Could not find user with id "${userId}"`)

  return user
}
