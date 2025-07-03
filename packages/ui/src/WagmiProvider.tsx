import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ChainId } from '@zodiac/chains'
import { useMemo } from 'react'
import {
  createConfig,
  http,
  useChainId as useChainIdBase,
  WagmiProvider as WagmiProviderBase,
} from 'wagmi'
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bob,
  celo,
  gnosis,
  mainnet,
  mantle,
  optimism,
  polygon,
  sepolia,
  sonic,
  unichain,
  worldchain,
  type Chain,
} from 'wagmi/chains'

export const chains: Record<ChainId, Chain> = {
  [mainnet.id]: mainnet,
  [optimism.id]: optimism,
  [gnosis.id]: gnosis,
  [polygon.id]: polygon,
  [sepolia.id]: sepolia,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [avalanche.id]: avalanche,
  [celo.id]: celo,
  [sonic.id]: sonic,
  [berachain.id]: berachain,
  [unichain.id]: unichain,
  [worldchain.id]: worldchain,
  [bob.id]: bob,
  [mantle.id]: mantle,
}

const defaultConfig = createConfig({
  chains: Object.values(chains) as any,
  transports: Object.fromEntries(
    Object.keys(chains).map((chainId) => [chainId, http()]) as any,
  ),
})

/** A read-only wagmi provider that can be used to read chain data from the chain specified by `chainId`. */
export const WagmiProvider = ({
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
      <WagmiProviderBase
        config={config}
        initialState={{
          chainId,
          connections: new Map(),
          current: null,
          status: 'disconnected',
        }}
      >
        {children}
      </WagmiProviderBase>
    </QueryClientProvider>
  )
}

export const useChainId = () => {
  const chainId = useChainIdBase()
  return chainId as ChainId
}
