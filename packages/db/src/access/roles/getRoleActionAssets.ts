import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleActionAssets = (db: DBClient, actionId: UUID) =>
  db.query.roleActionAsset.findMany({
    where(fields, { eq }) {
      return eq(fields.roleActionId, actionId)
    },
  })
