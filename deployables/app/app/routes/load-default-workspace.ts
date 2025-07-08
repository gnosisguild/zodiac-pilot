import { authorizedLoader } from '@/auth-server'
import { href, redirect } from 'react-router'
import type { Route } from './+types/load-default-workspace'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline'))
      }

      return redirect(
        href('/workspace/:workspaceId', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    },
  )
