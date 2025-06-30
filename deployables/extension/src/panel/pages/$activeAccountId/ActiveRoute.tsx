import { getRoute, getRoutes } from '@/accounts'
import { ProvideExecutionRoute } from '@/execution-routes'
import { sentry } from '@/sentry'
import { invariantResponse } from '@epic-web/invariant'
import { Divider } from '@zodiac/ui'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
  type Params,
} from 'react-router'
import { RouteSelect } from './RouteSelect'
import { getActiveAccountId } from './getActiveAccountId'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const activeAccountId = getActiveAccountId(params)

  try {
    return {
      accountId: activeAccountId,
      route: await getRoute(getActiveRouteId(params), {
        signal: request.signal,
      }),
      routes: await getRoutes(activeAccountId, { signal: request.signal }),
    }
  } catch (error) {
    sentry.captureException(error)

    throw redirect(`/${activeAccountId}`)
  }
}

const ActiveRoute = () => {
  const { route, routes, accountId } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <ProvideExecutionRoute route={route}>
      {routes.length > 1 && (
        <>
          <Divider />

          <div className="py-2 pl-4 pr-2">
            <RouteSelect
              routes={routes}
              value={route == null ? null : route.id}
              onChange={(routeId) => {
                if (routeId === route.id) {
                  return
                }

                navigate(`/${accountId}/${routeId}`)
              }}
            />
          </div>
        </>
      )}
      <Outlet />
    </ProvideExecutionRoute>
  )
}

export default ActiveRoute

const getActiveRouteId = (params: Params): string => {
  const { routeId } = params

  invariantResponse(routeId != null, 'Could not find routeId param')

  return routeId
}
