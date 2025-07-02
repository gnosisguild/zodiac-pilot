import { findDefaultRoute, getRoutes } from '@/accounts'
import { sentry } from '@/sentry'
import { redirect, type LoaderFunctionArgs } from 'react-router'
import { getActiveAccountId } from './getActiveAccountId'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const activeAccountId = getActiveAccountId(params)

  const defaultRoute = await findDefaultRoute(activeAccountId, {
    signal: request.signal,
  })

  if (defaultRoute != null) {
    return redirect(`/${activeAccountId}/${defaultRoute.id}`)
  }

  try {
    const [route] = await getRoutes(activeAccountId, { signal: request.signal })

    if (route != null) {
      return redirect(`/${activeAccountId}/${route.id}`)
    }

    return redirect(`/${activeAccountId}/no-routes`)
  } catch (error) {
    sentry.captureException(error)

    return redirect(`/${activeAccountId}/no-routes`)
  }
}
