import { ActionAssetTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const removeRoleActionAssets = (db: DBClient, actionId: UUID) =>
  db.delete(ActionAssetTable).where(eq(ActionAssetTable.roleActionId, actionId))
