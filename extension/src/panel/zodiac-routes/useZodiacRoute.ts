import { ETH_ZERO_ADDRESS, getChainId } from '@/chains'
import {
  getEip1193ReadOnlyProvider,
  isConnected,
  useInjectedWallet,
  useWalletConnect,
} from '@/providers'
import { Eip1193Provider, ProviderType, ZodiacRoute } from '@/types'
import { ZeroAddress } from 'ethers'
import { nanoid } from 'nanoid'
import { useCallback, useEffect } from 'react'
import { parsePrefixedAddress } from 'ser-kit'
import { useSelectedRouteId } from './SelectedRouteContext'
import { useZodiacRoutes } from './ZodiacRoutesContext'

const INITIAL_DEFAULT_ROUTE: ZodiacRoute = {
  id: nanoid(),
  label: '',
  providerType: ProviderType.InjectedWallet,
  avatar: ETH_ZERO_ADDRESS,
  initiator: undefined,
  waypoints: undefined,
}

export const useZodiacRoute = (id?: string) => {
  const routes = useZodiacRoutes()
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
