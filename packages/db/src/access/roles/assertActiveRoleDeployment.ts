import { invariant } from '@epic-web/invariant'
import { ActiveRoleDeployment, BaseRoleDeployment } from '@zodiac/db/schema'

export function assertActiveRoleDeployment(
  deployment: BaseRoleDeployment,
): asserts deployment is ActiveRoleDeployment {
  invariant(
    deployment.completedAt == null,
    'Deployment has already been completed',
  )

  invariant(
    deployment.cancelledById == null && deployment.cancelledAt == null,
    'Deployment has already been cancelled',
  )
}
