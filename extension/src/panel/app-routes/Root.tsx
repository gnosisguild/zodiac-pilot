import { useProviderBridge } from '@/bridge'
import { getChainId } from '@/chains'
import {
  useConnectInjectedWalletIfNeeded,
  useDisconnectWalletConnectIfNeeded,
} from '@/providers'
import { useProvider } from '@/providers-ui'
import {
  useMarkRouteAsUsed,
  useSaveZodiacRoute,
  useZodiacRoute,
} from '@/zodiac-routes'
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
  const route = useZodiacRoute()

  const chainId = getChainId(route.avatar)
  const provider = useProvider()
  const [, avatarAddress] = parsePrefixedAddress(route.avatar)
  const saveRoute = useSaveZodiacRoute()

  useProviderBridge({ provider, chainId, account: avatarAddress })
  useConnectInjectedWalletIfNeeded(route)
  useDisconnectWalletConnectIfNeeded(route, {
    onDisconnect: () =>
      saveRoute(
        fromLegacyConnection({ ...asLegacyConnection(route), pilotAddress: '' })
      ),
  })

  useStorage('lastUsedRoute', route.id)

  return <Outlet />
}
