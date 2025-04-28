import { RPC, type ChainId } from '@zodiac/chains'
import { JsonRpcProvider } from 'ethers'

export const jsonRpcProvider = (
  chainId: ChainId,
  rpcAddress: URL = RPC[chainId],
) =>
  new JsonRpcProvider(rpcAddress.toString(), chainId, {
    staticNetwork: true,
  })
