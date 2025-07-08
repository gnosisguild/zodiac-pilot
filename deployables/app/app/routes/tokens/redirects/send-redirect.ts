import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
import { href, redirect } from 'react-router'
import type { Route } from './+types/send-redirect'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      context: {
        auth: { tenant },
      },
    }) => {
      if (tenant == null) {
        return redirect(href('/offline/tokens/send/:chain?/:token?'))
      }

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant.id)

      return redirect(
        href('/workspace/:workspaceId/tokens/send/:chain?/:token?', {
          workspaceId: defaultWorkspace.id,
        }),
      )
    },
  )
