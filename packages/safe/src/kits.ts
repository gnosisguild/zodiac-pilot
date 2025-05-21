import SafeApiKit from '@safe-global/api-kit'
import SafeProtocolKit from '@safe-global/protocol-kit'
import { RPC, type ChainId } from '@zodiac/chains'

// Safe SDK sometimes is not up-to-date with transaction service urls. In that case we have to supply them manually.
const safeTransactionServiceUrls = {
  [146]: 'https://safe-transaction-sonic.safe.global/api',
  [80094]: 'https://safe-transaction-berachain.safe.global/api',
  [60808]: 'https://transaction.safe.gobob.xyz/api',
} as const

export const initSafeApiKit = (chainId: ChainId): SafeApiKit => {
  return new SafeApiKit({
    chainId: BigInt(chainId),
    txServiceUrl:
      chainId in safeTransactionServiceUrls
        ? safeTransactionServiceUrls[
            chainId as keyof typeof safeTransactionServiceUrls
          ]
        : undefined,
  })
}

export const initSafeProtocolKit = (
  chainId: ChainId,
  safeAddress: string,
): Promise<SafeProtocolKit> =>
  SafeProtocolKit.init({
    // we must pass the RPC endpoint as a string. If we pass an EIP1193 provider, Safe will send eth_requestAccounts calls (which will fail)
    provider: RPC[chainId].toString(),
    safeAddress,
  })
