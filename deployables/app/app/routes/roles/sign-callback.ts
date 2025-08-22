import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  completeRoleDeploymentIfNeeded,
  completeRoleDeploymentStep,
  dbClient,
  getRoleDeploymentStep,
} from '@zodiac/db'
import { getHexString } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import { Route } from './+types/sign-callback'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { workspaceId, deploymentId, roleId, deploymentStepId },
      context: {
        auth: { user },
      },
    }) => {
      invariantResponse(
        isUUID(deploymentStepId),
        '"deploymentStepId" is not a UUID',
      )
      invariantResponse(isUUID(deploymentId), '"deploymentId" is not a UUID')

      const data = await request.formData()

      await dbClient().transaction(async (tx) => {
        await completeRoleDeploymentStep(tx, user, {
          roleDeploymentStepId: deploymentStepId,
          transactionHash: getHexString(data, 'transactionHash'),
        })

        await completeRoleDeploymentIfNeeded(tx, deploymentId)
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
        tenant,
        params: { deploymentId, workspaceId, deploymentStepId },
      }) {
        invariantResponse(
          isUUID(deploymentStepId),
          '"deploymentStepId" is not a UUID',
        )

        const deploymentStep = await getRoleDeploymentStep(
          dbClient(),
          deploymentStepId,
        )

        return (
          deploymentStep.tenantId === tenant.id &&
          deploymentStep.roleDeploymentId === deploymentId &&
          deploymentStep.workspaceId === workspaceId
        )
      },
    },
  )
