import { authkitLoader, getSignInUrl } from '@workos-inc/authkit-react-router'
import { href, redirect } from 'react-router'
import type { Route } from './+types/sign-in'

export const loader = (args: Route.LoaderArgs) =>
  authkitLoader(args, async () => {
    return redirect(await getSignInUrl(href('/extension/callback')))
  })
