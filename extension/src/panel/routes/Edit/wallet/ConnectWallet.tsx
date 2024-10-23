import { ProviderType, Route } from '@/types'
import { invariant } from '@epic-web/invariant'
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

  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(route.avatar)

  invariant(chainId != null, 'chainId is empty')

  switch (route.providerType) {
    case ProviderType.InjectedWallet:
      return (
        <InjectedWallet
          pilotAddress={pilotAddress}
          chainId={chainId}
          initiator={route.initiator}
          onDisconnect={onDisconnect}
        />
      )
    case ProviderType.WalletConnect:
      return (
        <WalletConnect
          pilotAddress={pilotAddress}
          chainId={chainId}
          initiator={route.initiator}
          routeId={route.id}
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
