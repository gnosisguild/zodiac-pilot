import { sendMessageToTab } from '@/utils'
import { Chain, verifyChainId, type ChainId } from '@zodiac/chains'
import { RpcMessageType } from '@zodiac/messages'

export const probeChainId = async (tabId: number, url: string) => {
  const knownChain = Object.entries(fastTrack).reduce<ChainId | null>(
    (result, [chainId, urlPrefixes]) => {
      if (result != null) {
        return result
      }

      const isKnownUrl = urlPrefixes.some((urlPrefix) =>
        url.startsWith(urlPrefix),
      )

      if (isKnownUrl) {
        return verifyChainId(parseInt(chainId))
      }

      return result
    },
    null,
  )

  if (knownChain != null) {
    return knownChain
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

const fastTrack: Record<Chain, string[]> = {
  [Chain.ETH]: [
    'https://mainnet.infura.io/v3',
    'https://eth.merkle.io',
    'https://rpc.ankr.com/eth',
    'https://eth.drpc.org',
    'https://ethereum-rpc.publicnode.com',
  ],
  [Chain.OETH]: [
    'https://optimism-mainnet.infura.io/v3',
    'https://optimism.drpc.org',
  ],
  [Chain.GNO]: [],
  [Chain.SEP]: ['https://arbitrum-sepolia.infura.io/v3'],
  [Chain.MATIC]: [
    'https://polygon-mainnet.infura.io/v3',
    'https://polygon.drpc.org',
  ],
  [Chain.ZKEVM]: [],
  [Chain.ARB1]: [
    'https://arbitrum-mainnet.infura.io/v3',
    'https://arbitrum.drpc.org',
  ],
  [Chain.AVAX]: [
    'https://avalanche-mainnet.infura.io/v3',
    'https://avalanche.drpc.org',
  ],
  [Chain.BASE]: ['https://base-mainnet.infura.io/v3', 'https://base.drpc.org'],
  [Chain.BASESEP]: [],
  [Chain.CELO]: ['https://celo-mainnet.infura.io/v3', 'https://celo.drpc.org'],
  [Chain.SONIC]: ['https://www.shadow.so', 'https://sonic.drpc.org'],
  [Chain.BERACHAIN]: ['https://berachain.drpc.org'],
  [Chain.UNICHAIN]: [],
  [Chain.WORLDCHAIN]: [],
  [Chain.BOB]: [],
  [Chain.MANTLE]: ['https://mantle.drpc.org'],
  [Chain.HEMI]: [],
  [Chain.KATANA]: [],
  [Chain.LINEA]: [],
  [Chain.INK]: [],
}
