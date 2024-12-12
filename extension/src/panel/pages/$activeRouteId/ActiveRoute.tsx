import {
  getRoutes,
  markRouteAsUsed,
  ProvideExecutionRoute,
  saveLastUsedRouteId,
  useSaveExecutionRoute,
} from '@/execution-routes'
import { ProviderBridge } from '@/inject-bridge'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router'
import { saveStorageEntry } from '../../utils/saveStorageEntry'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from '../legacyConnectionMigrations'
import { getActiveRouteId } from './getActiveRouteId'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const activeRouteId = getActiveRouteId(params)

  const routes = await getRoutes()

  const route = routes.find((route) => route.id === activeRouteId)

  if (route == null) {
    await saveLastUsedRouteId(null)

    throw redirect('/')
  }

  await saveStorageEntry({ key: 'lastUsedRoute', value: route.id })

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
