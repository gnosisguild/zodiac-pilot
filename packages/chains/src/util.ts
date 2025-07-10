import { invariant } from '@epic-web/invariant'
import { Chain, chains } from './chains'

export const chainCurrency = (chain: Chain): string => {
  const chainConfig = chains[chain]
  return chainConfig?.nativeCurrency?.symbol || 'ETH'
}

export const chainName = (chain: Chain): string => {
  const chainConfig = chains[chain]
  return chainConfig?.name || `#${chain}`
}

export const explorerUrl = (chain: Chain): URL => {
  const chainConfig = chains[chain]
  const explorerUrl = chainConfig?.blockExplorers?.default?.url
  invariant(explorerUrl != null, 'No explorer url found for chain')
  return new URL(explorerUrl)
}
