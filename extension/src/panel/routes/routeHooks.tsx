import { getChainId } from '@/chains'
import {
  getEip1193ReadOnlyProvider,
  isConnected,
  useInjectedWallet,
  useWalletConnect,
} from '@/providers'
import { Eip1193Provider, ProviderType, Route } from '@/types'
import { ZeroAddress } from 'ethers'
import { nanoid } from 'nanoid'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { parsePrefixedAddress } from 'ser-kit'
import useStorage, { useStorageEntries } from '../utils/useStorage'

type RouteContextT = readonly [
  Route[],
  (value: Route) => void,
  (id: string) => void,
]
const RouteContext = createContext<RouteContextT | null>(null)
type SelectedRouteContextT = readonly [string, React.Dispatch<string>]
const SelectedRouteContext = createContext<SelectedRouteContextT | null>(null)

const ETH_ZERO_ADDRESS = 'eth:0x0000000000000000000000000000000000000000'
const INITIAL_DEFAULT_ROUTE: Route = {
  id: nanoid(),
  label: '',
  providerType: ProviderType.InjectedWallet,
  avatar: ETH_ZERO_ADDRESS,
  initiator: undefined,
  waypoints: undefined,
}

export const ProvideRoutes: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // we store routes as individual storage entries to alleviate concurrent write issues and to avoid running into the 8kb storage entry limit
  // (see: https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync)
  const [routes, setRoute, removeRoute] = useStorageEntries<Route>('routes')

  const saveRoute = useCallback(
    (route: Route) => {
      setRoute(route.id, route)
    },
    [setRoute]
  )

  const [selectedRouteId, setSelectedRouteId] =
    useStorage<string>('selectedRoute')

  const packedRoutesContext: RouteContextT = useMemo(
    () => [Object.values(routes || {}), saveRoute, removeRoute] as const,
    [routes, saveRoute, removeRoute]
  )
  const packedSelectedRouteContext: SelectedRouteContextT = useMemo(
    () => [selectedRouteId || '', setSelectedRouteId] as const,
    [selectedRouteId, setSelectedRouteId]
  )

  // wait for routes to be loaded from storage
  if (!routes) {
    return null
  }

  return (
    <RouteContext.Provider value={packedRoutesContext}>
      <SelectedRouteContext.Provider value={packedSelectedRouteContext}>
        {children}
      </SelectedRouteContext.Provider>
    </RouteContext.Provider>
  )
}

export const useUpdateLastUsedRoute = () => {
  const [selectedRouteId] = useSelectedRouteId()
  const [routes, saveRoute] = useRoutes()

  const updateRef = useRef<(routeId: string) => void>()
  updateRef.current = (routeId: string) => {
    const route = routes.find((route) => route.id === routeId)
    if (route) {
      saveRoute({ ...route, lastUsed: Date.now() })
    }
  }

  useEffect(() => {
    console.debug('update last used timestamp for route', selectedRouteId)
    updateRef.current!(selectedRouteId)
  }, [selectedRouteId])
}

export const useRoutes = () => {
  const result = useContext(RouteContext)
  if (!result) {
    throw new Error('useRoutes must be used within a <ProvideRoutes>')
  }
  return result
}

export const useSelectedRouteId = () => {
  const result = useContext(SelectedRouteContext)
  if (!result) {
    throw new Error('useSelectedRouteId must be used within a <ProvideRoutes>')
  }
  return result
}

export const useRoute = (id?: string) => {
  const [routes] = useRoutes()
  const [selectedRouteId] = useSelectedRouteId()
  const routeId = id || selectedRouteId
  const route =
    (routeId && routes.find((c) => c.id === routeId)) ||
    routes[0] ||
    INITIAL_DEFAULT_ROUTE

  const chainId = getChainId(route.avatar)

  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)
  const defaultProvider = getEip1193ReadOnlyProvider(chainId)

  const provider: Eip1193Provider =
    (route.providerType === ProviderType.InjectedWallet
      ? injectedWallet.provider
      : walletConnect?.provider) || defaultProvider

  const connected =
    route.initiator != null &&
    isConnected(
      route.providerType === ProviderType.InjectedWallet
        ? injectedWallet
        : walletConnect,
      route.initiator,
      chainId
    )

  const providerChainId =
    route.providerType === ProviderType.InjectedWallet
      ? injectedWallet.chainId
      : walletConnect?.chainId || null

  const mustConnectInjectedWallet =
    route.providerType === ProviderType.InjectedWallet &&
    !injectedWallet.chainId &&
    injectedWallet.connected

  const pilotAddress =
    route.initiator && route.initiator !== `eoa:` + ZeroAddress
      ? parsePrefixedAddress(route.initiator)[1].toLowerCase()
      : undefined
  const canEstablishConnection =
    !connected &&
    pilotAddress &&
    route.providerType === ProviderType.InjectedWallet &&
    injectedWallet.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    injectedWallet.chainId !== chainId

  const connectInjectedWallet = injectedWallet.connect
  const switchChain = injectedWallet.switchChain
  const requiredChainId = chainId

  useEffect(() => {
    if (mustConnectInjectedWallet) {
      connectInjectedWallet()
    }
  }, [mustConnectInjectedWallet, connectInjectedWallet])

  const connect = useCallback(async () => {
    if (requiredChainId && providerChainId !== requiredChainId) {
      try {
        await switchChain(requiredChainId)
      } catch (e) {
        console.error('Error switching chain', e)
        return false
      }
    }

    return true
  }, [switchChain, providerChainId, requiredChainId])

  return {
    route,
    provider,
    /** Indicates if `provider` is connected to the right account and chain. */
    connected,

    chainId,
    /** The chain ID the `provider` is currently connected to. */
    providerChainId,

    /** If this callback is set, it can be invoked to establish a connection to the Pilot wallet by asking the user to switch it to the right chain. */
    connect: canEstablishConnection ? connect : null,
  }
}
