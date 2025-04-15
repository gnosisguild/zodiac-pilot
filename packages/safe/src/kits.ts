import SafeApiKit from '@safe-global/api-kit'
import SafeProtocolKit from '@safe-global/protocol-kit'
import { RPC, type ChainId } from '@zodiac/chains'

export const initSafeApiKit = (chainId: ChainId): SafeApiKit => {
  return new SafeApiKit({ chainId: BigInt(chainId) })
}

export const initSafeProtocolKit = (
  chainId: ChainId,
  safeAddress: string,
): Promise<SafeProtocolKit> =>
  SafeProtocolKit.init({
    // we must pass the RPC endpoint as a string. If we pass an EIP1193 provider, Safe will send eth_requestAccounts calls (which will fail)
    provider: RPC[chainId],
    safeAddress,
  })
