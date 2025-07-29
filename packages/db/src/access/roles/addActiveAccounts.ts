import { ActivatedRoleTable, Role } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const addActiveAccounts = (
  db: DBClient,
  role: Role,
  accounts: UUID[],
) => {
  if (accounts.length === 0) {
    return
  }

  return db
    .insert(ActivatedRoleTable)
    .values(
      accounts.map((account) => ({
        roleId: role.id,
        tenantId: role.tenantId,
        accountId: account,
        workspaceId: role.workspaceId,
      })),
    )
    .onConflictDoNothing()
}
