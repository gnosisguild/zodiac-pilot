import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { TenantTable } from '../../../schema'
import type { DBClient } from '../../dbClient'

type SetDefaultWorkspaceOptions = {
  tenantId: UUID
  workspaceId: UUID
}

export const setDefaultWorkspace = (
  db: DBClient,
  { workspaceId, tenantId }: SetDefaultWorkspaceOptions,
) =>
  db
    .update(TenantTable)
    .set({ defaultWorkspaceId: workspaceId })
    .where(eq(TenantTable.id, tenantId))
