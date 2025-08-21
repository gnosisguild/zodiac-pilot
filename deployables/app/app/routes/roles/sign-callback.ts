import { authorizedLoader } from '@/auth-server'
import {
  completeRoleDeploymentIfNeeded,
  completeRoleDeploymentStep,
  dbClient,
  getRoleDeploymentStepByProposalId,
} from '@zodiac/db'
import { getHexString, getUUID } from '@zodiac/form-data'
import { href, redirect } from 'react-router'
import { Route } from './+types/sign-callback'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { workspaceId, deploymentId, roleId },
      context: {
        auth: { user },
      },
    }) => {
      const data = await request.formData()

      const deploymentStep = await getRoleDeploymentStepByProposalId(
        dbClient(),
        getUUID(data, 'proposalId'),
      )

      await dbClient().transaction(async (tx) => {
        await completeRoleDeploymentStep(tx, user, {
          roleDeploymentStepId: deploymentStep.id,
          transactionHash: getHexString(data, 'transactionHash'),
        })

        await completeRoleDeploymentIfNeeded(
          tx,
          deploymentStep.roleDeploymentId,
        )
      })

      return redirect(
        href('/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId', {
          workspaceId,
          deploymentId,
          roleId,
        }),
      )
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
