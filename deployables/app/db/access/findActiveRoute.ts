import type { DBClient } from '../dbClient'
import type { User } from '../schema'

export const findActiveRoute = async (
  db: DBClient,
  user: User,
  accountId: string,
) => {
  const route = await db.query.activeRoute.findFirst({
    where(fields, { eq, and }) {
      return and(
        eq(fields.tenantId, user.tenantId),
        eq(fields.userId, user.id),
        eq(fields.accountId, accountId),
      )
    },
    with: {
      route: {
        with: {
          wallet: true,
        },
      },
    },
  })

  return route
}
