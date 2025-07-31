import { invariant } from '@epic-web/invariant'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleActionAsset = async (db: DBClient, assetId: UUID) => {
  const asset = await db.query.roleActionAsset.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, assetId)
    },
  })

  invariant(asset != null, `Could not find asset with id "${assetId}"`)

  return asset
}
