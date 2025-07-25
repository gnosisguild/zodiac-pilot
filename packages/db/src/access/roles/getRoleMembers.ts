import { Role, RoleMembershipTable, UserTable } from '@zodiac/db/schema'
import { asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const getRoleMembers = async (db: DBClient, role: Role) => {
  const members = await db
    .select()
    .from(RoleMembershipTable)
    .where(eq(RoleMembershipTable.roleId, role.id))
    .innerJoin(UserTable, eq(RoleMembershipTable.userId, UserTable.id))
    .orderBy(asc(UserTable.fullName))

  return members.map(({ User }) => User)
}
