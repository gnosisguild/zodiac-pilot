import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const findPendingRoleDeployment = (db: DBClient, roleId: UUID) =>
  db.query.roleDeployment.findFirst({
    where(fields, { and, eq, isNull }) {
      return and(
        eq(fields.roleId, roleId),
        isNull(fields.completedAt),
        isNull(fields.cancelledAt),
      )
    },
  })
