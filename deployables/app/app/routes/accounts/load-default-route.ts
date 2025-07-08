import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, findDefaultRoute } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-default-route'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { accountId, workspaceId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const defaultRoute = await findDefaultRoute(
        dbClient(),
        tenant,
        user,
        accountId,
      )

      if (defaultRoute == null) {
        return redirect(
          href('/workspace/:workspaceId/accounts/:accountId/route/:routeId?', {
            accountId,
            workspaceId,
          }),
        )
      }

      return redirect(
        href('/workspace/:workspaceId/accounts/:accountId/route/:routeId?', {
          accountId,
          workspaceId,
          routeId: defaultRoute.routeId,
        }),
      )
    },
    { ensureSignedIn: true },
  )
