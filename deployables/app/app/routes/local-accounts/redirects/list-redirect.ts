import { authorizedLoader } from '@/auth-server'
import { href, redirect } from 'react-router'
import type { Route } from './+types/list-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/accounts'))
      }

      return redirect(
        href('/workspace/:workspaceId/accounts', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    },
  )
