import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig } from 'connectkit'
import type { PropsWithChildren } from 'react'
import { createConfig, injected, WagmiProvider } from 'wagmi'
import { metaMask, walletConnect } from 'wagmi/connectors'

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

export const WalletProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
  </QueryClientProvider>
)
