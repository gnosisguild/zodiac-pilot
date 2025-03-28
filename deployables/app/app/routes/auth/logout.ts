import { invariantResponse } from '@epic-web/invariant'
import { authkitLoader, getWorkOS } from '@workos-inc/authkit-remix'
import { redirect, type LoaderFunction } from 'react-router'
import type { Route } from './+types/logout'

export const loader: LoaderFunction = (args: Route.LoaderArgs) =>
  authkitLoader(args, async ({ auth }) => {
    const workos = getWorkOS()

    invariantResponse(auth.sessionId != null, 'User is not logged in')

    return redirect(
      workos.userManagement.getLogoutUrl({
        sessionId: auth.sessionId,
        returnTo: 'http://localhost:3040',
      }),
    )
  })
