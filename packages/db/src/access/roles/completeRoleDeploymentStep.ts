import { RoleDeploymentStepTable, User } from '@zodiac/db/schema'
import { Hex } from '@zodiac/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type CompleteRoleDeploymentStepOptions = {
  roleDeploymentStepId: UUID
  transactionHash: Hex
}

export const completeRoleDeploymentStep = (
  db: DBClient,
  user: User,
  { roleDeploymentStepId, transactionHash }: CompleteRoleDeploymentStepOptions,
) =>
  db
    .update(RoleDeploymentStepTable)
    .set({ completedAt: new Date(), completedById: user.id, transactionHash })
    .where(eq(RoleDeploymentStepTable.id, roleDeploymentStepId))
