import type { ChainId } from '@zodiac/chains'
import { useChainId as useChainIdBase } from 'wagmi'

export const useChainId = () => {
  const chainId = useChainIdBase()
  return chainId as ChainId
}
