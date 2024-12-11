import { getChainId } from '@/chains'
import {
  useExecutionRoute,
  useMarkRouteAsUsed,
  useSaveExecutionRoute,
} from '@/execution-routes'
import { useProviderBridge } from '@/inject-bridge'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { useProvider } from '@/providers-ui'
import { Outlet } from 'react-router-dom'
import { parsePrefixedAddress } from 'ser-kit'
import { useStorage } from '../utils'
import {
  asLegacyConnection,
  fromLegacyConnection,
} from './legacyConnectionMigrations'

export const Root = () => {
  // update the last used timestamp for the current route
  useMarkRouteAsUsed()

  // make sure the injected provider stays updated on every relevant route change
  const route = useExecutionRoute()

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
