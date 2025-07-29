import { Role, RoleMembershipTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const addRoleMembers = (db: DBClient, role: Role, members: UUID[]) => {
  if (members.length === 0) {
    return
  }

  return db
    .insert(RoleMembershipTable)
    .values(
      members.map((member) => ({
        roleId: role.id,
        userId: member,
        tenantId: role.tenantId,
      })),
    )
    .onConflictDoNothing()
}
