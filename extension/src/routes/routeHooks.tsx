import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { useMetaMask, useWalletConnect } from '../providers'
import {
  Route,
  LegacyConnection,
  Eip1193Provider,
  ProviderType,
} from '../types'
import { useStickyState } from '../utils'
import { MetaMaskContextT } from '../providers/useMetaMask'
import { WalletConnectResult } from '../providers/useWalletConnect'
import { getEip1193ReadOnlyProvider } from '../providers/readOnlyProvider'
import {
  fromLegacyConnection,
  migrateLegacyConnections,
} from './legacyConnectionMigrations'
import { parsePrefixedAddress, PrefixedAddress } from 'ser-kit'
import { nanoid } from 'nanoid'

type RouteContextT = [Route[], React.Dispatch<React.SetStateAction<Route[]>>]
const RouteContext = createContext<RouteContextT | null>(null)
type SelectedRouteContextT = [string, React.Dispatch<string>]
const SelectedRouteContext = createContext<SelectedRouteContextT | null>(null)

const CONNECTIONS_DEFAULT_VALUE: LegacyConnection[] = [
  {
    id: nanoid(),
    label: '',
    chainId: 1,
    moduleAddress: '',
    avatarAddress: '',
    pilotAddress: '',
    providerType: ProviderType.WalletConnect,
    moduleType: undefined,
    roleId: '',
  },
]

const ETH_ZERO_ADDRESS = 'eth:0x0000000000000000000000000000000000000000'
const ROUTES_DEFAULT_VALUE: Route[] = [
  {
    id: nanoid(),
    label: '',
    providerType: ProviderType.MetaMask,
    avatar: ETH_ZERO_ADDRESS,
    initiator: undefined,
    waypoints: undefined,
  },
]

export const ProvideRoutes: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [legacyConnections] = useStickyState<LegacyConnection[]>(
    CONNECTIONS_DEFAULT_VALUE,
    'connections'
  )

  const [routes, setRoutes] = useStickyState<Route[]>(
    ROUTES_DEFAULT_VALUE,
    'routes'
  )

  const [isMigrated, setIsMigrated] = useState(
    routes.some(
      (r) => r.avatar !== ETH_ZERO_ADDRESS || r._migratedFromLegacyConnection
    ) || !legacyConnections.some((c) => c.avatarAddress)
  )

  const [selectedRouteId, setSelectedRouteId] = useStickyState<string>(
    routes[0].id,
    'selectedRoute'
  )

  useEffect(() => {
    if (!isMigrated) {
      migrateLegacyConnections(legacyConnections).then(
        (migratedConnections) => {
          const routes = migratedConnections
            .map(fromLegacyConnection)
            .filter(Boolean) as Route[]
          setRoutes(routes)
          setIsMigrated(true)
          setSelectedRouteId(routes[0].id)
        }
      )
    }
  }, [isMigrated, legacyConnections, setRoutes, setSelectedRouteId])

  const packedRoutesContext: RouteContextT = useMemo(
    () => [routes, setRoutes],
    [routes, setRoutes]
  )
  const packedSelectedRouteContext: SelectedRouteContextT = useMemo(
    () => [selectedRouteId, setSelectedRouteId],
    [selectedRouteId, setSelectedRouteId]
  )

  if (!isMigrated) {
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
  const [, setRoutes] = useRoutes()

  const updateLastUsedRoute = useCallback(
    (routeId: string) => {
      setRoutes((routes: Route[]) =>
        routes.map((route) =>
          route.id === routeId
            ? { ...route, lastUsed: Math.floor(Date.now() / 1000) }
            : route
        )
      )
    },
    [setRoutes]
  )

  useEffect(() => {
    console.debug('update last used timestamp for route', selectedRouteId)
    updateLastUsedRoute(selectedRouteId)
  }, [selectedRouteId, updateLastUsedRoute])
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
  const route = (routeId && routes.find((c) => c.id === routeId)) || routes[0]

  if (!route) {
    throw new Error('routes is empty, which must never happen')
  }

  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(route.avatar)
  if (!chainId) {
    throw new Error('chainId is empty')
  }

  const metamask = useMetaMask()
  const walletConnect = useWalletConnect(route.id)
  const defaultProvider = getEip1193ReadOnlyProvider(chainId)

  const provider: Eip1193Provider =
    (route.providerType === ProviderType.MetaMask
      ? metamask.provider
      : walletConnect?.provider) || defaultProvider

  const connected =
    route.initiator &&
    isConnectedTo(
      route.providerType === ProviderType.MetaMask ? metamask : walletConnect,
      route.initiator,
      chainId
    )

  const providerChainId =
    route.providerType === ProviderType.MetaMask
      ? metamask.chainId
      : walletConnect?.chainId || null

  const mustConnectMetaMask =
    route.providerType === ProviderType.MetaMask && !metamask.chainId

  const pilotAddress =
    route.initiator && parsePrefixedAddress(route.initiator)[1].toLowerCase()
  const canEstablishConnection =
    !connected &&
    pilotAddress &&
    route.providerType === ProviderType.MetaMask &&
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
  providerContext: MetaMaskContextT | WalletConnectResult | null,
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
