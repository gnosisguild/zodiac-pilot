import type { Chain } from '@/balances-server'
import { invariant } from '@epic-web/invariant'
import type { ChainId } from '@zodiac/chains'
import { createContext, useContext, type PropsWithChildren } from 'react'

const ChainContext = createContext<Chain[]>([])

export const ProvideChains = ({
  chains,
  children,
}: PropsWithChildren<{ chains: Chain[] }>) => (
  <ChainContext value={chains}>{children}</ChainContext>
)

export const useChain = (chainId?: ChainId) => {
  const chains = useContext(ChainContext)

  if (chainId == null) {
    return null
  }

  const chain = chains.find((chain) => chain.community_id === chainId)

  invariant(chain != null, `Could not find chain with id "${chainId}"`)

  return chain
}
