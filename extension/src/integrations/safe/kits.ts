import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import * as ethers from 'ethers'

import { getReadOnlyProvider } from '../../providers/readOnlyProvider'
import { ChainId } from 'ser-kit'

export const TX_SERVICE_URL: Record<ChainId, string | undefined> = {
  [1]: 'https://safe-transaction-mainnet.safe.global',
  [10]: 'https://safe-transaction-optimism.safe.global',
  // [56]: 'https://safe-transaction-bsc.safe.global',
  [100]: 'https://safe-transaction-gnosis-chain.safe.global',
  [137]: 'https://safe-transaction-polygon.safe.global',
  // [246]: 'https://safe-transaction-ewc.safe.global',
  [8453]: 'https://safe-transaction-base.safe.global',
  [42161]: 'https://safe-transaction-arbitrum.safe.global',
  [43114]: 'https://safe-transaction-avalanche.safe.global',
  // [42220]: 'https://safe-transaction-celo.safe.global',
  // [73799]: 'https://safe-transaction-volta.safe.global',
  [11155111]: 'https://safe-transaction-sepolia.safe.global',
}

export const initSafeApiKit = (chainId: ChainId) => {
  const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
  if (!txServiceUrl) {
    throw new Error(`service not available for chain #${chainId}`)
  }

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: getReadOnlyProvider(chainId),
  })

  return new SafeApiKit({ txServiceUrl, ethAdapter })
}

export const initSafeProtocolKit = async (
  chainId: ChainId,
  safeAddress: string
) => {
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: getReadOnlyProvider(chainId),
  })

  return await Safe.create({ ethAdapter, safeAddress })
}
