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

export async function getRoleMembers(
  db: DBClient,
  options: GetByWorkspace,
): Promise<Record<UUID, User[]>>
export async function getRoleMembers(
  db: DBClient,
  options: GetByRole,
): Promise<User[]>
export async function getRoleMembers(
  db: DBClient,
  options: GetRoleMembersOptions,
): Promise<Record<UUID, User[]> | User[]> {
  const members = await db
    .select()
    .from(RoleMembershipTable)
    .where(getWhere(options))
    .innerJoin(UserTable, eq(RoleMembershipTable.userId, UserTable.id))
    .orderBy(asc(UserTable.fullName))

  if ('roleId' in options) {
    return members.map(({ User }) => User)
  }

  return members.reduce<Record<UUID, User[]>>(
    (result, { RoleMembership, User }) => {
      if (RoleMembership.roleId in result) {
        return {
          ...result,
          [RoleMembership.roleId]: [...result[RoleMembership.roleId], User],
        }
      }

      return { ...result, [RoleMembership.roleId]: [User] }
    },
    {},
  )
}

const getWhere = (options: GetRoleMembersOptions) => {
  if ('workspaceId' in options) {
    return eq(RoleMembershipTable.workspaceId, options.workspaceId)
  }

  return eq(RoleMembershipTable.roleId, options.roleId)
}
