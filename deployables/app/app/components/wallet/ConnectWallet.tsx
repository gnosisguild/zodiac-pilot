import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  type ExecutionRoute,
  type HexAddress,
  ProviderType,
} from '@zodiac/schema'
import { getDefaultConfig } from 'connectkit'
import { ZeroAddress } from 'ethers'
import { type ChainId, parsePrefixedAddress } from 'ser-kit'
import { createConfig, WagmiProvider } from 'wagmi'
import { Connected } from './Connected'
import { InjectedWallet } from './injectedWallet'
import { WalletConnect } from './walletConnect'

const queryClient = new QueryClient()

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'Zodiac Pilot',
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
  }),
)

interface Props {
  routeId: string
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType?: ProviderType
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
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <Connected onDisconnect={onDisconnect} onConnect={onConnect} />
          </WagmiProvider>
        </QueryClientProvider>
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
