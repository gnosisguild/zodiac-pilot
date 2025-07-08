import { authorizedLoader } from '@/auth-server'
import { href, redirect } from 'react-router'
import type { Route } from './+types/balances-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/tokens/balances'))
      }

      return redirect(
        href('/workspace/:workspaceId/tokens/balances', {
          workspaceId: tenant.defaultWorkspaceId,
        }),
      )
    },
  )
