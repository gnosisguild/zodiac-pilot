import { ActionAssetTable, AllowanceInterval } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type UpdateAllowanceOptions = {
  allowance: bigint
  interval: AllowanceInterval
}

export const updateAllowance = (
  db: DBClient,
  assetId: UUID,
  { allowance, interval }: UpdateAllowanceOptions,
) =>
  db
    .update(ActionAssetTable)
    .set({ allowance, interval })
    .where(eq(ActionAssetTable.id, assetId))
