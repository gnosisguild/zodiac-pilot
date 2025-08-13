import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const findRoleByKey = (db: DBClient, workspaceId: UUID, key: string) =>
  db.query.role.findFirst({
    where(fields, { and, eq }) {
      return and(eq(fields.workspaceId, workspaceId), eq(fields.key, key))
    },
  })
