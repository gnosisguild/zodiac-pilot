import { ActivatedRoleTable, Role } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const setActiveAccounts = (
  db: DBClient,
  role: Role,
  accounts: UUID[],
) => {
  return db.transaction(async (tx) => {
    await tx
      .delete(ActivatedRoleTable)
      .where(eq(ActivatedRoleTable.roleId, role.id))

    if (accounts.length === 0) {
      return
    }

    return tx.insert(ActivatedRoleTable).values(
      accounts.map((account) => ({
        roleId: role.id,
        tenantId: role.tenantId,
        accountId: account,
        workspaceId: role.workspaceId,
      })),
    )
  })
}
