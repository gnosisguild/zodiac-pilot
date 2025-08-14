import { RoleMembershipTable, User, UserTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type GetByWorkspace = {
  workspaceId: UUID
}

type GetByRole = {
  roleId: UUID
}

type GetRoleMembersOptions = GetByWorkspace | GetByRole

type UserFragment = Pick<User, 'id' | 'fullName'>

export async function getRoleMembers(
  db: DBClient,
  options: GetByWorkspace,
): Promise<Record<UUID, UserFragment[]>>
export async function getRoleMembers(
  db: DBClient,
  options: GetByRole,
): Promise<User[]>
export async function getRoleMembers(
  db: DBClient,
  options: GetRoleMembersOptions,
): Promise<Record<UUID, UserFragment[]> | User[]> {
  if ('roleId' in options) {
    const members = await db
      .select()
      .from(RoleMembershipTable)
      .where(getWhere(options))
      .innerJoin(UserTable, eq(RoleMembershipTable.userId, UserTable.id))
      .orderBy(asc(UserTable.fullName))

    return members.map(({ User }) => User)
  }

  const members = await db
    .select({
      roleId: RoleMembershipTable.roleId,
      member: { id: UserTable.id, fullName: UserTable.fullName },
    })
    .from(RoleMembershipTable)
    .where(getWhere(options))
    .innerJoin(UserTable, eq(RoleMembershipTable.userId, UserTable.id))
    .orderBy(asc(UserTable.fullName))

  return members.reduce<Record<UUID, User[]>>((result, { roleId, member }) => {
    if (roleId in result) {
      return {
        ...result,
        [roleId]: [...result[roleId], member],
      }
    }

    return { ...result, [roleId]: [member] }
  }, {})
}

const getWhere = (options: GetRoleMembersOptions) => {
  if ('workspaceId' in options) {
    return eq(RoleMembershipTable.workspaceId, options.workspaceId)
  }

  return eq(RoleMembershipTable.roleId, options.roleId)
}
