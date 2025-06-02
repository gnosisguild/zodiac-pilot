import { getWagmiConfig } from '@/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo, type PropsWithChildren } from 'react'
import { WagmiProvider } from 'wagmi'

export type WalletProviderProps = PropsWithChildren<{
  injectedOnly?: boolean
}>

export const WalletProvider = ({
  children,
  injectedOnly = false,
}: WalletProviderProps) => {
  const config = useMemo(() => getWagmiConfig(injectedOnly), [injectedOnly])
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  )
}
