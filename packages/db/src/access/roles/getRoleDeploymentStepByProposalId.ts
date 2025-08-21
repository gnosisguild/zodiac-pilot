import { invariant } from '@epic-web/invariant'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

export const getRoleDeploymentStepByProposalId = async (
  db: DBClient,
  proposalId: UUID,
) => {
  const deploymentStep = await db.query.roleDeploymentStep.findFirst({
    where(fields, { eq }) {
      return eq(fields.proposedTransactionId, proposalId)
    },
  })

  invariant(
    deploymentStep,
    `Could not find any role deployment step for proposal id "${proposalId}"`,
  )

  return deploymentStep
}
