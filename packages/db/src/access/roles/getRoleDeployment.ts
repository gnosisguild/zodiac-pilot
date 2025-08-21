import { invariant } from '@epic-web/invariant'
import { RoleDeployment } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'
import { assertRoleDeployment } from './assertRoleDeployment'

export const getRoleDeployment = async (
  db: DBClient,
  roleDeploymentId: UUID,
): Promise<RoleDeployment> => {
  const deployment = await db.query.roleDeployment.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, roleDeploymentId)
    },
  })

  invariant(
    deployment != null,
    `Could not find role deployment with id "${roleDeploymentId}"`,
  )

  assertRoleDeployment(deployment)

  return deployment
}
