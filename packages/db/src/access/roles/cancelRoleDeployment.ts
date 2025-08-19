import { RoleDeploymentTable, User } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const cancelRoleDeployment = (
  db: DBClient,
  user: User,
  deploymentId: UUID,
) =>
  db
    .update(RoleDeploymentTable)
    .set({ cancelledAt: new Date(), cancelledById: user.id })
    .where(eq(RoleDeploymentTable.id, deploymentId))
