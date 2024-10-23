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
          routeId={route.id}
          pilotAddress={pilotAddress}
          onDisconnect={onDisconnect}
        />
      )
    case ProviderType.WalletConnect:
      return <WalletConnect pilotAddress={pilotAddress} routeId={route.id} />
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
