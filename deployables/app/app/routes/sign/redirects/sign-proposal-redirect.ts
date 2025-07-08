import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getDefaultWorkspace,
  getProposedTransaction,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/sign-proposal-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
      params: { proposalId, routeId },
    }) => {
      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant.id)

      if (routeId == null) {
        return redirect(
          href('/workspace/:workspaceId/submit/proposal/:proposalId', {
            workspaceId: defaultWorkspace.id,
            proposalId,
          }),
        )
      }

      return redirect(
        href('/workspace/:workspaceId/submit/proposal/:proposalId/:routeId', {
          workspaceId: defaultWorkspace.id,
          proposalId,
          routeId,
        }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { proposalId } }) {
        invariantResponse(isUUID(proposalId), '"proposalId" is not a UUID')

        const proposal = await getProposedTransaction(dbClient(), proposalId)

        return proposal.tenantId === tenant.id
      },
    },
  )
