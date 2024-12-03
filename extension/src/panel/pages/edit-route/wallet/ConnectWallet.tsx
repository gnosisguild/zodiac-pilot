import { getChainId } from '@/chains'
import {
  InjectedWalletContextT,
  WalletConnectResult,
  isConnected as isConnectedBase,
} from '@/providers'
import { ExecutionRoute, ProviderType } from '@/types'
import { ZeroAddress } from 'ethers'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import { InjectedWallet, InjectedWalletConnect } from './injectedWallet'
import { WalletConnect, WalletConnectConnect } from './walletConnect'

interface Props {
  route: ExecutionRoute
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
  onError: () => void
}

export const ConnectWallet = ({
  route,
  onConnect,
  onDisconnect,
  onError,
}: Props) => {
  const pilotAddress = getPilotAddress(route)
  const chainId = getChainId(route.avatar)

  const isConnected = (
    provider: InjectedWalletContextT | WalletConnectResult
  ) =>
    route.initiator != null &&
    isConnectedBase(provider, route.initiator, chainId)

  // not connected
  if (pilotAddress == null) {
    return (
      <div className="flex flex-col gap-2">
        <WalletConnectConnect
          routeId={route.id}
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.WalletConnect,
              chainId,
              account,
            })
          }
          onError={onError}
        />

        <InjectedWalletConnect
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.InjectedWallet,
              chainId,
              account,
            })
          }
          onError={onError}
        />
      </div>
    )
  }

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return (
        <InjectedWallet
          chainId={chainId}
          pilotAddress={pilotAddress}
          isConnected={isConnected}
          onDisconnect={onDisconnect}
          onError={onError}
        />
      )
    case ProviderType.WalletConnect:
      return (
        <WalletConnect
          chainId={chainId}
          pilotAddress={pilotAddress}
          routeId={route.id}
          isConnected={isConnected}
          onDisconnect={onDisconnect}
          onError={onError}
        />
      )
  }
}

const getPilotAddress = (route: ExecutionRoute) => {
  if (route.initiator == null) {
    return null
  }

  const address = parsePrefixedAddress(route.initiator)[1].toLowerCase()

  if (address === ZeroAddress) {
    return null
  }

  return address
}
