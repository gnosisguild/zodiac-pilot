import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findDefaultRoute,
  getProposedTransaction,
  getRoutes,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-default-route'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { proposalId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(proposalId), '"proposalId" is not a UUID')

      const proposal = await getProposedTransaction(dbClient(), proposalId)

      const defaultRoute = await findDefaultRoute(
        dbClient(),
        tenant,
        user,
        proposal.accountId,
      )

      if (defaultRoute != null) {
        return redirect(
          href('/submit/proposal/:proposalId/:routeId', {
            proposalId,
            routeId: defaultRoute.routeId,
          }),
        )
      }

      const [route] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        accountId: proposal.accountId,
      })

      if (route != null) {
        return redirect(
          href('/submit/proposal/:proposalId/:routeId', {
            proposalId,
            routeId: route.id,
          }),
        )
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { proposalId }, tenant }) {
        invariantResponse(isUUID(proposalId), '"proposalId" is not a UUID')

        const proposal = await getProposedTransaction(dbClient(), proposalId)

        return proposal.tenantId === tenant.id
      },
    },
  )
