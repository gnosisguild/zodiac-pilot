import { TenantMembershipTable, User, UserTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { asc, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

type GetUsersOptions = {
  tenantId: UUID
}

type UserFragment = Pick<User, 'id' | 'fullName'>

export async function getUsers(db: DBClient): Promise<User[]>
export async function getUsers(
  db: DBClient,
  options: GetUsersOptions,
): Promise<UserFragment[]>
export async function getUsers(db: DBClient, options?: GetUsersOptions) {
  if (options != null) {
    const users = await db
      .select({ id: UserTable.id, fullName: UserTable.fullName })
      .from(TenantMembershipTable)
      .where(eq(TenantMembershipTable.tenantId, options.tenantId))
      .innerJoin(UserTable, eq(TenantMembershipTable.userId, UserTable.id))
      .orderBy(asc(UserTable.fullName))

    return users
  }

  return db.query.user.findMany({
    orderBy(fields, { asc }) {
      return asc(fields.fullName)
    },
  })
}
