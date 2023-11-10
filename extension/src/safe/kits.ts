import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import * as ethers from 'ethers'

import { ChainId } from '../networks'
import { Eip1193Provider } from '../types'

export const TX_SERVICE_URL: Record<ChainId, string | undefined> = {
  [1]: 'https://safe-transaction-mainnet.safe.global',
  [4]: 'https://safe-transaction-rinkeby.safe.global',
  [5]: 'https://safe-transaction-goerli.safe.global',
  [10]: 'https://safe-transaction-optimism.safe.global',
  [56]: 'https://safe-transaction-bsc.safe.global',
  [100]: 'https://safe-transaction-gnosis-chain.safe.global',
  [137]: 'https://safe-transaction-polygon.safe.global',
  [246]: 'https://safe-transaction-ewc.safe.global',
  [42161]: 'https://safe-transaction-arbitrum.safe.global',
  [42220]: undefined, // not available
  [73799]: 'https://safe-transaction-volta.safe.global',
  [80001]: undefined, // not available
}

export const initSafeApiKit = (provider: Eip1193Provider, chainId: ChainId) => {
  const web3Provider = new ethers.providers.Web3Provider(provider)

  const txServiceUrl = TX_SERVICE_URL[chainId as ChainId]
  if (!txServiceUrl) {
    throw new Error(`service not available for chain #${chainId}`)
  }

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: web3Provider.getSigner(),
  })

  return new SafeApiKit({ txServiceUrl, ethAdapter })
}

export const initSafeProtocolKit = async (
  provider: Eip1193Provider,
  safeAddress: string
) => {
  const web3Provider = new ethers.providers.Web3Provider(provider)

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: web3Provider.getSigner(),
  })

  return await Safe.create({ ethAdapter, safeAddress })
}
