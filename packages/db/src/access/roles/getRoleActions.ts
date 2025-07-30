import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleActions = (db: DBClient, roleId: UUID) =>
  db.query.roleAction.findMany({
    where(fields, { eq }) {
      return eq(fields.roleId, roleId)
    },
    orderBy(fields, { asc }) {
      return asc(fields.label)
    },
    with: {
      createdBy: { columns: { fullName: true } },
    },
  })
