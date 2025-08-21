import { RoleDeploymentStepTable } from '@zodiac/db/schema'
import { Hex } from '@zodiac/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type UpdateRoleDeploymentStepOptions = {
  proposedTransactionId?: UUID
  transactionHash?: Hex
}

export const updateRoleDeploymentStep = (
  db: DBClient,
  roleDeploymentStepId: UUID,
  { proposedTransactionId, transactionHash }: UpdateRoleDeploymentStepOptions,
) =>
  db
    .update(RoleDeploymentStepTable)
    .set({ proposedTransactionId, transactionHash })
    .where(eq(RoleDeploymentStepTable.id, roleDeploymentStepId))
