import { authkitLoader, getSignInUrl } from '@workos-inc/authkit-react-router'
import { redirect } from 'react-router'
import type { Route } from './+types/sign-in'

export const loader = async (args: Route.LoaderArgs) =>
  authkitLoader(args, async () => redirect(await getSignInUrl()))
