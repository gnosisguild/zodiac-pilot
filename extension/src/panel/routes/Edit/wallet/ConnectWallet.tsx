import { getChainId } from '@/chains'
import {
  InjectedWalletContextT,
  WalletConnectResult,
  isConnected as isConnectedBase,
} from '@/providers'
import { ProviderType, Route } from '@/types'
import { ZeroAddress } from 'ethers'
import { ChainId, parsePrefixedAddress } from 'ser-kit'
import { InjectedWallet, InjectedWalletConnect } from './injectedWallet'
import { WalletConnect, WalletConnectConnect } from './walletConnect'

interface Props {
  route: Route
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
}

export const ConnectWallet = ({ route, onConnect, onDisconnect }: Props) => {
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
        />

        <InjectedWalletConnect
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.InjectedWallet,
              chainId,
              account,
            })
          }
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
          onDisconnect={onDisconnect}
          isConnected={isConnected}
        />
      )
    case ProviderType.WalletConnect:
      return (
        <WalletConnect
          pilotAddress={pilotAddress}
          chainId={chainId}
          routeId={route.id}
          isConnected={isConnected}
        />
      )
  }
}

const getPilotAddress = (route: Route) => {
  if (route.initiator == null) {
    return null
  }

  const address = parsePrefixedAddress(route.initiator)[1].toLowerCase()

  if (address === ZeroAddress) {
    return null
  }

  return address
}
