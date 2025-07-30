import { invariant } from '@epic-web/invariant'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRole = async (db: DBClient, roleId: UUID) => {
  const role = await db.query.role.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, roleId)
    },
  })

  invariant(role != null, `Could not find role with id "${roleId}"`)

  return role
}
