import { getRoute, getRoutes } from '@/accounts'
import { ProvideExecutionRoute } from '@/execution-routes'
import { sentry } from '@/sentry'
import { ProvideForkProvider } from '@/transactions'
import { invariantResponse } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { Divider } from '@zodiac/ui'
import { useRef } from 'react'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useRevalidator,
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

  useRevalidateOnRoutesUpdate()

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
      <ProvideForkProvider route={route}>
        <Outlet />
      </ProvideForkProvider>
    </ProvideExecutionRoute>
  )
}

export default ActiveRoute

const getActiveRouteId = (params: Params): string => {
  const { routeId } = params

  invariantResponse(routeId != null, 'Could not find routeId param')

  return routeId
}

const useRevalidateOnRoutesUpdate = () => {
  const lastUpdate = useRef<Date>(null)
  const revalidator = useRevalidator()

  useTabMessageHandler(CompanionAppMessageType.PING, ({ lastRoutesUpdate }) => {
    if (lastUpdate.current !== lastRoutesUpdate) {
      revalidator.revalidate()
    }

    lastUpdate.current = lastRoutesUpdate
  })
}
