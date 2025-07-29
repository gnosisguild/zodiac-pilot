import { Role, RoleMembershipTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const setRoleMembers = (db: DBClient, role: Role, members: UUID[]) => {
  return db.transaction(async (tx) => {
    await tx
      .delete(RoleMembershipTable)
      .where(eq(RoleMembershipTable.roleId, role.id))

    if (members.length === 0) {
      return
    }

    return tx.insert(RoleMembershipTable).values(
      members.map((member) => ({
        roleId: role.id,
        userId: member,
        tenantId: role.tenantId,
        workspaceId: role.workspaceId,
      })),
    )
  })
}
