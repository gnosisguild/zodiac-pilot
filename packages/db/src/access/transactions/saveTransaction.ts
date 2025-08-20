import {
  SignedTransactionTable,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import { safeJson, type MetaTransactionRequest } from '@zodiac/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'
import { getRoute } from '../routes'

type SaveTransactionOptions = {
  accountId: UUID
  walletId: UUID
  routeId: UUID
  workspaceId: UUID

  transaction: MetaTransactionRequest[]

  safeWalletUrl: string | undefined
  explorerUrl: string | undefined
}

export const saveTransaction = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  { transaction, routeId, ...options }: SaveTransactionOptions,
) => {
  const route = await getRoute(db, routeId)

  const [result] = await db
    .insert(SignedTransactionTable)
    .values({
      tenantId: tenant.id,
      userId: user.id,
      transaction: safeJson(transaction),

      routeLabel: route.label,
      waypoints: route.waypoints,

      ...options,
    })
    .returning()

  return result
}
