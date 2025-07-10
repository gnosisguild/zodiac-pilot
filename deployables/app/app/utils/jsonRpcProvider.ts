import { rpc, type ChainId } from '@zodiac/chains'
import { JsonRpcProvider } from 'ethers'

export const jsonRpcProvider = (
  chainId: ChainId,
  rpcAddress: URL = rpc(chainId),
) =>
  new JsonRpcProvider(rpcAddress.toString(), chainId, {
    staticNetwork: true,
  })
