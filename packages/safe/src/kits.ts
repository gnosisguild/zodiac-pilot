import { invariant } from '@epic-web/invariant'
import SafeApiKit from '@safe-global/api-kit'
import SafeProtocolKit from '@safe-global/protocol-kit'
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
  const txServiceUrl = TX_SERVICE_URL[chainId]

  invariant(txServiceUrl != null, `service not available for chain #${chainId}`)

  return new SafeApiKit({ txServiceUrl, chainId: BigInt(chainId) })
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
