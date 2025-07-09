import { authorizedLoader } from '@/auth-server'
import { dbClient, getWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/offline-sign-transaction'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { route, transactions },
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(
          href('/offline/submit/:route/:transactions', { route, transactions }),
        )
      }
      const defaultWorkspace = await getWorkspace(
        dbClient(),
        tenant.defaultWorkspaceId,
      )

      return redirect(
        href(
          '/workspace/:workspaceId/local-accounts/submit/:route/:transactions',
          { workspaceId: defaultWorkspace.id, route, transactions },
        ),
      )
    },
  )
