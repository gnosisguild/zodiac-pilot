import { authorizedLoader } from '@/auth-server'
import { dbClient, getDefaultWorkspace } from '@zodiac/db'
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

      const defaultWorkspace = await getDefaultWorkspace(dbClient(), tenant.id)

      return redirect(
        href('/workspace/:workspaceId', { workspaceId: defaultWorkspace.id }),
      )
    },
  )
