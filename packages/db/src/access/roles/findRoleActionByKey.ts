import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const findRoleActionByKey = (
  db: DBClient,
  roleId: UUID,
  actionKey: string,
) =>
  db.query.roleAction.findFirst({
    where(fields, { and, eq }) {
      return and(eq(fields.roleId, roleId), eq(fields.key, actionKey))
    },
  })
