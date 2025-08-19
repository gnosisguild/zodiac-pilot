import { invariant } from '@epic-web/invariant'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleDeployment = async (
  db: DBClient,
  roleDeploymentId: UUID,
) => {
  const deployment = await db.query.roleDeployment.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, roleDeploymentId)
    },
  })

  invariant(
    deployment != null,
    `Could not find role deployment with id "${roleDeploymentId}"`,
  )

  return deployment
}
