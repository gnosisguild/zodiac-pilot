import {
  type ExecutionRoute,
  type HexAddress,
  ProviderType,
} from '@zodiac/schema'
import { ZeroAddress } from 'ethers'
import { type ChainId, parsePrefixedAddress } from 'ser-kit'
import { InjectedWallet } from './injectedWallet'
import { WalletConnect } from './walletConnect'

interface Props {
  routeId: string
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType: ProviderType
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
  onError: () => void
}

export const ConnectWallet = ({
  routeId,
  pilotAddress,
  chainId,
  providerType,
  onConnect,
  onDisconnect,
  onError,
}: Props) => {
  // const isConnected = (
  //   provider: InjectedWalletContextT | WalletConnectResult,
  // ) =>
  //   route.initiator != null &&
  //   isConnectedBase(provider, route.initiator, chainId)

  // not connected
  if (pilotAddress == null) {
    return (
      <div className="flex flex-col gap-2">
        {/* <WalletConnectConnect
          routeId={route.id}
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.WalletConnect,
              chainId,
              account,
            })
          }
          onError={onError}
        /> */}

        {/* <InjectedWalletConnect
          onConnect={(chainId, account) =>
            onConnect({
              providerType: ProviderType.InjectedWallet,
              chainId,
              account,
            })
          }
          onError={onError}
        /> */}
      </div>
    )
  }

  switch (providerType) {
    case ProviderType.InjectedWallet:
      return (
        <InjectedWallet
          chainId={chainId}
          pilotAddress={pilotAddress}
          onDisconnect={onDisconnect}
          onError={onError}
        />
      )
    case ProviderType.WalletConnect:
      return (
        <WalletConnect
          chainId={chainId}
          pilotAddress={pilotAddress}
          routeId={routeId}
          isConnected={() => true}
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

  const address = parsePrefixedAddress(route.initiator).toLowerCase()

  if (address === ZeroAddress) {
    return null
  }

  return address
}
