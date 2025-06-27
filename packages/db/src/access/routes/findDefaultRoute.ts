import type { Tenant, User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const findDefaultRoute = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: UUID,
) =>
  db.query.defaultRoute.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.tenantId, tenant.id),
        eq(fields.userId, user.id),
        eq(fields.accountId, accountId),
      )
    },
  })
