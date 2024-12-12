import {
  getRoutes,
  markRouteAsUsed,
  ProvideExecutionRoute,
  useSaveExecutionRoute,
} from '@/execution-routes'
import { ProviderBridge } from '@/inject-bridge'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { invariant } from '@epic-web/invariant'
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import { useStorage } from '../../utils'
import { getActiveRouteId } from './getActiveRouteId'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from './legacyConnectionMigrations'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const activeRouteId = getActiveRouteId(params)

  const routes = await getRoutes()

  const route = routes.find((route) => route.id === activeRouteId)

  invariant(route != null, `Could not find route with id "${activeRouteId}"`)

  return { route: await markRouteAsUsed(route) }
}

export const ActiveRoute = () => {
  // make sure the injected provider stays updated on every relevant route change
  const { route } = useLoaderData<typeof loader>()

  const saveRoute = useSaveExecutionRoute()

  useConnectInjectedWalletIfNeeded(route)
  useDisconnectWalletConnectIfNeeded(route, {
    onDisconnect: () =>
      saveRoute(
        fromLegacyConnection({
          ...asLegacyConnection(route),
          pilotAddress: '',
        }),
      ),
  })

  useStorage('lastUsedRoute', route.id)

  return (
    <ProvideExecutionRoute route={route}>
      <ProvideProvider>
        <ProviderBridge avatar={route.avatar}>
          <Outlet />
        </ProviderBridge>
      </ProvideProvider>
    </ProvideExecutionRoute>
  )
}
