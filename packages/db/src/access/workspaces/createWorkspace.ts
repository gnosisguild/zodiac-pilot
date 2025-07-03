import { WorkspaceTable, type Tenant, type User } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

type CreateWorkspaceOptions = {
  tenant: Tenant
  createdBy: User
  label: string
}

export const createWorkspace = async (
  db: DBClient,
  { tenant, createdBy, label }: CreateWorkspaceOptions,
) => {
  const [workspace] = await db
    .insert(WorkspaceTable)
    .values({ createdById: createdBy.id, tenantId: tenant.id, label })
    .returning()

  return workspace
}
