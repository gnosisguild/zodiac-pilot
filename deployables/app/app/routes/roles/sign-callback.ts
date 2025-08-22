import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  completeRoleDeploymentIfNeeded,
  completeRoleDeploymentStep,
  dbClient,
  getProposedTransaction,
  getRoleDeploymentStep,
  getSignedTransaction,
  getUser,
} from '@zodiac/db'
import { getHexString, getUUID } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import { href } from 'react-router'
import { Route } from './+types/sign-callback'

export const action = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { workspaceId, deploymentId, roleId, deploymentStepId },
    }) => {
      invariantResponse(
        isUUID(deploymentStepId),
        '"deploymentStepId" is not a UUID',
      )
      invariantResponse(isUUID(deploymentId), '"deploymentId" is not a UUID')

      const data = await request.formData()

      const proposal = await getProposedTransaction(
        dbClient(),
        getUUID(data, 'proposalId'),
      )

      invariantResponse(
        proposal.signedTransactionId != null,
        'Transaction proposal has not been signed, yet.',
      )

      const transaction = await getSignedTransaction(
        dbClient(),
        proposal.signedTransactionId,
      )
      const user = await getUser(dbClient(), transaction.userId)

      await dbClient().transaction(async (tx) => {
        await completeRoleDeploymentStep(tx, user, {
          roleDeploymentStepId: deploymentStepId,
          transactionHash: getHexString(data, 'transactionHash'),
        })

        await completeRoleDeploymentIfNeeded(tx, deploymentId)
      })

      return Response.json({
        redirectTo: href(
          '/workspace/:workspaceId/roles/:roleId/deployment/:deploymentId',
          {
            workspaceId,
            deploymentId,
            roleId,
          },
        ),
      })
    },
    {
      ensureSignedIn: false,
      async hasAccess({
        request,
        params: { deploymentId, workspaceId, deploymentStepId },
      }) {
        const data = await request.formData()

        const proposal = await getProposedTransaction(
          dbClient(),
          getUUID(data, 'proposalId'),
        )

        const state = new URL(request.url).searchParams.get('state')

        if (proposal.callbackState !== state) {
          return false
        }

        invariantResponse(
          isUUID(deploymentStepId),
          '"deploymentStepId" is not a UUID',
        )

        const deploymentStep = await getRoleDeploymentStep(
          dbClient(),
          deploymentStepId,
        )

        return (
          deploymentStep.tenantId === proposal.tenantId &&
          deploymentStep.roleDeploymentId === deploymentId &&
          deploymentStep.workspaceId === workspaceId
        )
      },
    },
  )
