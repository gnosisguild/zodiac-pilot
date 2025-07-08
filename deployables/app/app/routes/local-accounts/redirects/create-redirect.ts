import { authorizedLoader } from '@/auth-server'
import { href, redirect } from 'react-router'
import type { Route } from './+types/create-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/accounts/create'))
      }

      return redirect(
        href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    },
  )
