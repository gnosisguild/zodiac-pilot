import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/edit-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
      params: { routeId, data },
    }) => {
      if (tenant == null) {
        return redirect(
          href('/offline/accounts/:accountId/:data', {
            accountId: routeId,
            data,
          }),
        )
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant.id)

      return redirect(
        href('/workspace/:workspaceId/local-accounts/:accountId/:data', {
          accountId: routeId,
          data,
          workspaceId: defaultWorkspace.id,
        }),
      )
    },
  )
