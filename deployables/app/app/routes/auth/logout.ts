import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader, getWorkOS } from '@workos-inc/authkit-react-router'
import { redirect } from 'react-router'
import type { Route } from './+types/logout'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, async ({ auth }) => {
    const workos = getWorkOS()

    invariantResponse(auth.sessionId != null, 'User is not logged in')

    throw redirect(
      workos.userManagement.getLogoutUrl({
        sessionId: auth.sessionId,
      }),
    )
  })
