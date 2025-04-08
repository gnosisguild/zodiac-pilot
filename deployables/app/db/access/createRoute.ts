import type { DBClient } from '../dbClient'
import { RouteTable, type Account, type Wallet } from '../schema'

export const createRoute = async (
  db: DBClient,
  wallet: Wallet,
  account: Account,
) => {
  const [route] = await db
    .insert(RouteTable)
    .values({
      fromId: wallet.id,
      toId: account.id,
      tenantId: wallet.tenantId,
    })
    .returning()

  return route
}
