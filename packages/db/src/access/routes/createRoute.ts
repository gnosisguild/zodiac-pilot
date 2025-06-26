import { RouteTable } from '@zodiac/db/schema'
import type { Waypoints } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'
import { getWallet } from '../wallets'

type CreateRouteOptions = {
  label?: string | null
  walletId: UUID
  accountId: UUID
  waypoints: Waypoints
}

export const createRoute = async (
  db: DBClient,
  tenantId: UUID,
  { waypoints, walletId, accountId, label = null }: CreateRouteOptions,
) => {
  const wallet = await getWallet(db, walletId)

  const [route] = await db
    .insert(RouteTable)
    .values({
      label,
      fromId: walletId,
      toId: accountId,
      userId: wallet.belongsToId,
      tenantId: tenantId,
      waypoints,
    })
    .returning()

  return route
}
