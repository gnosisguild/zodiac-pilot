import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig } from 'connectkit'
import { useMemo, type PropsWithChildren } from 'react'
import { createConfig, WagmiProvider } from 'wagmi'
import {
  arbitrum,
  avalanche,
  base,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains'
import { injected, metaMask, mock, walletConnect } from 'wagmi/connectors'

const queryClient = new QueryClient()

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

export type WalletProviderProps = PropsWithChildren<{
  injectedOnly?: boolean
}>

export const WalletProvider = ({
  children,
  injectedOnly = false,
}: WalletProviderProps) => {
  const config = useMemo(() => getWagmiConfig(injectedOnly), [injectedOnly])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  )
}

export const getWagmiConfig = (injectedOnly: boolean) =>
  createConfig(
    getDefaultConfig({
      appName: 'Zodiac Pilot',
      ssr: true,
      walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      chains: [
        mainnet,
        optimism,
        gnosis,
        polygon,
        sepolia,
        base,
        arbitrum,
        avalanche,
      ],
      connectors: injectedOnly
        ? [
            injected(),
            process.env.NODE_ENV === 'test' &&
              mock({
                accounts: ['0x1000000000000000000000000000000000000000'],
              }),
          ].filter(Boolean)
        : [
            injected(),
            metaMask(),
            walletConnect({
              projectId: WALLETCONNECT_PROJECT_ID,
              showQrModal: false,
            }),
          ],
    }),
  )
