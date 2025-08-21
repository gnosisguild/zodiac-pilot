import { authorizedLoader } from '@/auth-server'
import {
  dbClient,
  getRoleDeploymentStepByProposalId,
  updateRoleDeploymentStep,
} from '@zodiac/db'
import { getHexString, getUUID } from '@zodiac/form-data'
import { Route } from './+types/sign-callback'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ request }) => {
      const data = await request.formData()

      const deploymentStep = await getRoleDeploymentStepByProposalId(
        dbClient(),
        getUUID(data, 'proposalId'),
      )

      await updateRoleDeploymentStep(dbClient(), deploymentStep.id, {
        transactionHash: getHexString(data, 'transactionHash'),
      })

      return null
    },
    {
      ensureSignedIn: true,
      async hasAccess({
        request,
        tenant,
        params: { deploymentId, workspaceId },
      }) {
        const data = await request.formData()

        const deploymentStep = await getRoleDeploymentStepByProposalId(
          dbClient(),
          getUUID(data, 'proposalId'),
        )

        return (
          deploymentStep.tenantId === tenant.id &&
          deploymentStep.roleDeploymentId === deploymentId &&
          deploymentStep.workspaceId === workspaceId
        )
      },
    },
  )
