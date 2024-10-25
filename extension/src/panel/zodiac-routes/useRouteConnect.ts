import { getChainId } from '@/chains'
import { isConnected, useInjectedWallet, useWalletConnect } from '@/providers'
import { ProviderType, ZodiacRoute } from '@/types'
import { ZeroAddress } from 'ethers'
import { useCallback } from 'react'
import { parsePrefixedAddress } from 'ser-kit'

export const useRouteConnect = (route: ZodiacRoute) => {
  const chainId = getChainId(route.avatar)

  const injectedWallet = useInjectedWallet()
  const walletConnect = useWalletConnect(route.id)

  const connected =
    route.initiator != null &&
    isConnected(
      route.providerType === ProviderType.InjectedWallet
        ? injectedWallet
        : walletConnect,
      route.initiator,
      chainId
    )

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

  const switchChain = injectedWallet.switchChain
  const requiredChainId = chainId

  const providerChainId =
    route.providerType === ProviderType.InjectedWallet
      ? injectedWallet.chainId
      : walletConnect?.chainId || null

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
