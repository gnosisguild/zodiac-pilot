import { invariant } from '@epic-web/invariant'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleAction = async (db: DBClient, actionId: UUID) => {
  const action = await db.query.roleAction.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, actionId)
    },
  })

  invariant(action != null, `Could not find role action with id "${actionId}"`)

  return action
}
