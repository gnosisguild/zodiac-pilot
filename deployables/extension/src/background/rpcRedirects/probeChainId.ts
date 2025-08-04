import { sendMessageToTab } from '@/utils'
import { Chain, type ChainId } from '@zodiac/chains'
import { RpcMessageType } from '@zodiac/messages'

export const probeChainId = async (tabId: number, url: string) => {
  const knownChain = Object.entries(fastTrack).find(([urlPrefix]) =>
    url.startsWith(urlPrefix),
  )

  if (knownChain != null) {
    return knownChain[1]
  }

  return timeout<ChainId>(
    sendMessageToTab(tabId, { type: RpcMessageType.PROBE_CHAIN_ID, url }),
    `Could not probe chain ID for url "${url}".`,
  )
}

const CHAIN_ID_PROBING_TIMEOUT = 10_000

const timeout = <T>(promise: Promise<T>, errorMessage: string) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(errorMessage), CHAIN_ID_PROBING_TIMEOUT),
    ),
  ])

const fastTrack = {
  'https://arbitrum-mainnet.infura.io/v3': Chain.ARB1,
  'https://arbitrum-sepolia.infura.io/v3': Chain.SEP,
  'https://avalanche-mainnet.infura.io/v3': Chain.AVAX,
  'https://base-mainnet.infura.io/v3': Chain.BASE,
  'https://celo-mainnet.infura.io/v3': Chain.CELO,
  'https://mainnet.infura.io/v3': Chain.ETH,
  'https://optimism-mainnet.infura.io/v3': Chain.OETH,
  'https://polygon-mainnet.infura.io/v3': Chain.MATIC,

  'https://eth.merkle.io': Chain.ETH,

  'https://rpc.ankr.com/eth': Chain.ETH,

  'https://www.shadow.so': Chain.SONIC,

  'https://eth.drpc.org': Chain.ETH,
  'https://optimism.drpc.org': Chain.OETH,
  'https://arbitrum.drpc.org': Chain.ARB1,
  'https://avalanche.drpc.org': Chain.AVAX,
  'https://polygon.drpc.org': Chain.MATIC,
  'https://mantle.drpc.org': Chain.MANTLE,
  'https://base.drpc.org': Chain.BASE,
  'https://celo.drpc.org': Chain.CELO,
  'https://berachain.drpc.org': Chain.BERACHAIN,
  'https://sonic.drpc.org': Chain.SONIC,
}
