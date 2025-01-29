import { isConnected, useInjectedWallet } from '@/providers'
import { type ExecutionRoute } from '@/types'
import { getChainId } from '@zodiac/chains'
import { ZeroAddress } from 'ethers'
import { useCallback } from 'react'
import { parsePrefixedAddress } from 'ser-kit'
import { useProviderChainId } from './useProviderChainId'

export const useRouteConnect = (route: ExecutionRoute) => {
  const { switchChain } = useInjectedWallet()
  const connected = useConnected(route)
  const providerChainId = useProviderChainId()
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

const useConnected = (route: ExecutionRoute) => {
  const injectedWallet = useInjectedWallet()

  if (route.initiator == null) {
    return false
  }

  const chainId = getChainId(route.avatar)

  return isConnected(injectedWallet, route.initiator, chainId)
}

const useCanEstablishConnection = (route: ExecutionRoute) => {
  const injectedWallet = useInjectedWallet()
  const connected = useConnected(route)

  if (connected) {
    return false
  }

  const pilotAddress =
    route.initiator && route.initiator !== `eoa:` + ZeroAddress
      ? parsePrefixedAddress(route.initiator).toLowerCase()
      : undefined

  if (pilotAddress == null) {
    return false
  }

  if (injectedWallet.chainId !== getChainId(route.avatar)) {
    return false
  }

  return injectedWallet.accounts.some(
    (acc) => acc.toLowerCase() === pilotAddress,
  )
}
