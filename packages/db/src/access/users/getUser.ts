import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getUser = async (db: DBClient, userId: UUID) => {
  const user = await db.query.user.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, userId)
    },
  })

  invariant(user != null, `Could not find user with id "${userId}"`)

  return user
}
