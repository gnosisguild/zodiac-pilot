import { authorizedLoader } from '@/auth-server'
import {
  completeRoleDeploymentStep,
  dbClient,
  getRoleDeploymentStepByProposalId,
} from '@zodiac/db'
import { getHexString, getUUID } from '@zodiac/form-data'
import { Route } from './+types/sign-callback'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      const deploymentStep = await getRoleDeploymentStepByProposalId(
        dbClient(),
        getUUID(data, 'proposalId'),
      )

      await completeRoleDeploymentStep(dbClient(), user, {
        roleDeploymentStepId: deploymentStep.id,
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
