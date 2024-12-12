import { getChainId } from '@/chains'
import {
  getRoutes,
  useMarkRouteAsUsed,
  useSaveExecutionRoute,
} from '@/execution-routes'
import { useProviderBridge } from '@/inject-bridge'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { useProvider } from '@/providers-ui'
import { invariant } from '@epic-web/invariant'
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router-dom'
import { parsePrefixedAddress } from 'ser-kit'
import { useStorage } from '../utils'
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

  return { route }
}

export const Root = () => {
  // update the last used timestamp for the current route
  useMarkRouteAsUsed()

  // make sure the injected provider stays updated on every relevant route change
  const { route } = useLoaderData<typeof loader>()

  const saveRoute = useSaveExecutionRoute()

  useProviderBridge({
    provider: useProvider(),
    chainId: getChainId(route.avatar),
    account: parsePrefixedAddress(route.avatar),
  })
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

  return <Outlet />
}
