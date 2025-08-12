import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

type GetByRoleOptions = {
  roleId: UUID
}

type GetByActionOptions = {
  actionId: UUID
}

type GetRoleActionAssetsOptions = GetByRoleOptions | GetByActionOptions

export function getRoleActionAssets(
  db: DBClient,
  options: GetRoleActionAssetsOptions,
) {
  return db.query.roleActionAsset.findMany({
    where(fields, { eq }) {
      if ('actionId' in options) {
        return eq(fields.roleActionId, options.actionId)
      }

      return eq(fields.roleId, options.roleId)
    },
  })
}
