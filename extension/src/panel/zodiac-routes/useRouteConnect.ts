import { getChainId } from '@/chains'
import { isConnected, useInjectedWallet, useWalletConnect } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'
import { ZeroAddress } from 'ethers'
import { useCallback } from 'react'
import { parsePrefixedAddress } from 'ser-kit'
import { useProviderChainId } from './useProviderChainId'

export const useRouteConnect = (route: ZodiacRoute) => {
  const { switchChain } = useInjectedWallet()
  const connected = useConnected(route)
  const providerChainId = useProviderChainId(route)
  const canEstablishConnection = useCanEstablishConnection(route)

  const requiredChainId = getChainId(route.avatar)

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

  return [
    /** Indicates if `provider` is connected to the right account and chain. */
    connected,
    /** If this callback is set, it can be invoked to establish a connection to the Pilot wallet by asking the user to switch it to the right chain. */
    canEstablishConnection ? connect : null,
  ] as const
}

const useConnected = (route: ZodiacRoute) => {
  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  if (route.initiator == null) {
    return false
  }

  const chainId = getChainId(route.avatar)

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return isConnected(injectedWallet, route.initiator, chainId)
    case ProviderType.WalletConnect:
      return isConnected(walletConnect, route.initiator, chainId)
  }
}

const useCanEstablishConnection = (route: ZodiacRoute) => {
  const injectedWallet = useInjectedWallet()
  const connected = useConnected(route)

  if (connected) {
    return false
  }

  const pilotAddress =
    route.initiator && route.initiator !== `eoa:` + ZeroAddress
      ? parsePrefixedAddress(route.initiator)[1].toLowerCase()
      : undefined

  if (pilotAddress == null) {
    return false
  }

  if (route.providerType !== ProviderType.InjectedWallet) {
    return false
  }

  if (injectedWallet.chainId !== getChainId(route.avatar)) {
    return false
  }

  return injectedWallet.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress
  )
}
