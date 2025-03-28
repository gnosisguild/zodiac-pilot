import { getSignInUrl } from '@workos-inc/authkit-remix'
import { redirect } from 'react-router'

export const loader = async () => {
  return redirect(await getSignInUrl())
}
