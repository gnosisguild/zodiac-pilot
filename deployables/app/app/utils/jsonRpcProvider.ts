import { RPC, type ChainId } from '@zodiac/chains'
import { JsonRpcProvider } from 'ethers'

export const jsonRpcProvider = (
  chainId: ChainId,
  rpcAddress: string = RPC[chainId],
) =>
  new JsonRpcProvider(rpcAddress, chainId, {
    staticNetwork: true,
  })
