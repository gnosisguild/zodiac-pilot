import React, { ReactNode, useCallback, useEffect, useRef } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useInjectedWallet, useWalletConnect } from '../providers'
import { Route, Eip1193Provider, ProviderType } from '../../types'
import { InjectedWalletContextT } from '../providers/useInjectedWallet'
import { WalletConnectResult } from '../providers/useWalletConnect'
import { getEip1193ReadOnlyProvider } from '../providers/readOnlyProvider'

import { parsePrefixedAddress, PrefixedAddress } from 'ser-kit'
import { nanoid } from 'nanoid'
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
    if (!route) throw new Error('route not found')
    saveRoute({ ...route, lastUsed: Math.floor(Date.now() / 1000) })
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

  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(route.avatar)
  if (!chainId) {
    throw new Error('chainId is empty')
  }

  const metamask = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)
  const defaultProvider = getEip1193ReadOnlyProvider(chainId)

  const provider: Eip1193Provider =
    (route.providerType === ProviderType.InjectedWallet
      ? metamask.provider
      : walletConnect?.provider) || defaultProvider

  const connected =
    route.initiator &&
    isConnectedTo(
      route.providerType === ProviderType.InjectedWallet
        ? metamask
        : walletConnect,
      route.initiator,
      chainId
    )

  const providerChainId =
    route.providerType === ProviderType.InjectedWallet
      ? metamask.chainId
      : walletConnect?.chainId || null

  const mustConnectMetaMask =
    route.providerType === ProviderType.InjectedWallet && !metamask.chainId

  const pilotAddress =
    route.initiator && parsePrefixedAddress(route.initiator)[1].toLowerCase()
  const canEstablishConnection =
    !connected &&
    pilotAddress &&
    route.providerType === ProviderType.InjectedWallet &&
    metamask.accounts.some((acc) => acc.toLowerCase() === pilotAddress) &&
    metamask.chainId !== chainId

  const connectMetaMask = metamask.connect
  const switchChain = metamask.switchChain
  const requiredChainId = chainId

  useEffect(() => {
    if (mustConnectMetaMask) {
      connectMetaMask()
    }
  }, [mustConnectMetaMask, connectMetaMask])

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

const isConnectedTo = (
  providerContext: InjectedWalletContextT | WalletConnectResult | null,
  account: PrefixedAddress,
  chainId?: number
) => {
  if (!providerContext) return false
  const [_chain, accountAddress] = parsePrefixedAddress(account)
  const accountLower = accountAddress.toLowerCase()

  return (
    providerContext &&
    (!chainId || chainId === providerContext.chainId) &&
    providerContext.accounts?.some(
      (acc) => acc.toLowerCase() === accountLower
    ) &&
    ('connected' in providerContext ? providerContext.connected : true)
  )
}
