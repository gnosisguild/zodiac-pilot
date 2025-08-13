import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { ActionAssetTable } from '../../../schema'
import { DBClient } from '../../dbClient'

export const removeAllowance = (db: DBClient, assetId: UUID) =>
  db
    .update(ActionAssetTable)
    .set({ allowance: null, interval: null })
    .where(eq(ActionAssetTable.id, assetId))
