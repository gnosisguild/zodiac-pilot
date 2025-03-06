import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import { Chain, RPC, type ChainId } from '@zodiac/chains'

export const TX_SERVICE_URL: Record<ChainId, string | undefined> = {
  [Chain.ETH]: 'https://safe-transaction-mainnet.safe.global/api',
  [Chain.OETH]: 'https://safe-transaction-optimism.safe.global/api',
  // [56]: 'https://safe-transaction-bsc.safe.global',
  [Chain.GNO]: 'https://safe-transaction-gnosis-chain.safe.global/api',
  [Chain.MATIC]: 'https://safe-transaction-polygon.safe.global/api',
  // [246]: 'https://safe-transaction-ewc.safe.global',
  [Chain.BASE]: 'https://safe-transaction-base.safe.global/api',
  [Chain.ARB1]: 'https://safe-transaction-arbitrum.safe.global/api',
  [Chain.AVAX]: 'https://safe-transaction-avalanche.safe.global/api',
  // [42220]: 'https://safe-transaction-celo.safe.global',
  // [73799]: 'https://safe-transaction-volta.safe.global',
  [Chain.SEP]: 'https://safe-transaction-sepolia.safe.global/api',
}

export const initSafeApiKit = (chainId: ChainId): SafeApiKit => {
  const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
  if (!txServiceUrl) {
    throw new Error(`service not available for chain #${chainId}`)
  }

  // @ts-expect-error SafeApiKit is only available as a CJS module. That doesn't play super nice with us being ESM.
  if (SafeApiKit.default) {
    // @ts-expect-error See above
    return new SafeApiKit.default({ txServiceUrl, chainId: BigInt(chainId) })
  }

  return new SafeApiKit({ txServiceUrl, chainId: BigInt(chainId) })
}

export const initSafeProtocolKit = (
  chainId: ChainId,
  safeAddress: string,
): Promise<Safe> => {
  // @ts-expect-error protocol-kit is only available as a CJS module. That doesn't play super nice with us being ESM.
  if (Safe.default) {
    // @ts-expect-error protocol-kit is only available as a CJS module. That doesn't play super nice with us being ESM.
    return Safe.default.init({
      // we must pass the RPC endpoint as a string. If we pass an EIP1193 provider, Safe will send eth_requestAccounts calls (which will fail)
      provider: RPC[chainId],
      safeAddress,
    })
  }

  return Safe.init({
    // we must pass the RPC endpoint as a string. If we pass an EIP1193 provider, Safe will send eth_requestAccounts calls (which will fail)
    provider: RPC[chainId],
    safeAddress,
  })
}
