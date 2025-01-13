import { invariant } from '@epic-web/invariant'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type HexAddress, ProviderType } from '@zodiac/schema'
import { getDefaultConfig } from 'connectkit'
import { type ChainId } from 'ser-kit'
import { createConfig, WagmiProvider } from 'wagmi'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { Connect } from './Connect'
import { Wallet } from './Wallet'

const queryClient = new QueryClient()

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'Zodiac Pilot',
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    connectors: [
      injected(),
      metaMask(),
      walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
    ],
  }),
)

interface Props {
  pilotAddress: HexAddress | null
  chainId?: ChainId
  providerType?: ProviderType
  onConnect(args: {
    providerType: ProviderType
    chainId: ChainId
    account: string
  }): void
  onDisconnect(): void
}

export const ConnectWallet = ({
  pilotAddress,
  chainId,
  providerType,
  onConnect,
  onDisconnect,
}: Props) => {
  if (pilotAddress == null) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <Connect onConnect={onConnect} />
        </WagmiProvider>
      </QueryClientProvider>
    )
  }

  invariant(
    providerType != null,
    'providerType is required when pilotAddress is set',
  )

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <Wallet
          chainId={chainId}
          providerType={providerType}
          pilotAddress={pilotAddress}
          onDisconnect={onDisconnect}
        />
      </WagmiProvider>
    </QueryClientProvider>
  )
}
