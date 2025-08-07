import { ActionAssetTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type UpdatePermissionOptions = {
  allowBuy: boolean
  allowSell: boolean
}

export const updatePermissions = (
  db: DBClient,
  assetId: UUID,
  permissions: UpdatePermissionOptions,
) =>
  db
    .update(ActionAssetTable)
    .set(permissions)
    .where(eq(ActionAssetTable.id, assetId))
