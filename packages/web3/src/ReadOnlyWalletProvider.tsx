import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { chains, type ChainId } from '@zodiac/chains'
import { useMemo } from 'react'
import { createConfig, http, WagmiProvider } from 'wagmi'

const defaultConfig = createConfig({
  chains: Object.values(chains) as any,
  transports: Object.fromEntries(
    Object.keys(chains).map((chainId) => [chainId, http()]) as any,
  ),
})

/** A read-only wagmi provider that can be used to read chain data from the chain specified by `chainId`. */
export const ReadOnlyWalletProvider = ({
  children,
  chainId,
  config = defaultConfig,
}: {
  children: React.ReactNode
  chainId: ChainId
  config?: ReturnType<typeof createConfig>
}) => {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider
        config={config}
        initialState={{
          chainId,
          connections: new Map(),
          current: null,
          status: 'disconnected',
        }}
      >
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  )
}
