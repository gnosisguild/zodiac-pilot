import { RoleDeploymentStepTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type UpdateRoleDeploymentStepOptions = {
  proposedTransactionId?: UUID
}

export const updateRoleDeploymentStep = (
  db: DBClient,
  roleDeploymentStepId: UUID,
  { proposedTransactionId }: UpdateRoleDeploymentStepOptions,
) =>
  db
    .update(RoleDeploymentStepTable)
    .set({ proposedTransactionId })
    .where(eq(RoleDeploymentStepTable.id, roleDeploymentStepId))
