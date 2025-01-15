import { RPC, type ChainId } from '@zodiac/chains'
import { JsonRpcProvider } from 'ethers'

export const jsonRpcProvider = (chainId: ChainId) =>
  new JsonRpcProvider(RPC[chainId], chainId, {
    staticNetwork: true,
  })
