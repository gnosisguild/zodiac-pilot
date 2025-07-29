import { TenantMembershipTable, UserTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { asc, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type GetUsersOptions = {
  tenantId?: UUID
}

export const getUsers = async (
  db: DBClient,
  { tenantId }: GetUsersOptions = {},
) => {
  if (tenantId != null) {
    const users = await db
      .select()
      .from(TenantMembershipTable)
      .where(eq(TenantMembershipTable.tenantId, tenantId))
      .innerJoin(UserTable, eq(TenantMembershipTable.userId, UserTable.id))
      .orderBy(asc(UserTable.fullName))

    return users.map(({ User }) => User)
  }

  return db.query.user.findMany({
    orderBy(fields, { asc }) {
      return asc(fields.fullName)
    },
  })
}
