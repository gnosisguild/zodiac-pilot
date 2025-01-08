/* spell-checker: disable */
import type { HexAddress } from '@zodiac/schema'
import type { ChainId, PrefixedAddress } from 'ser-kit'

export const ZERO_ADDRESS: HexAddress =
  '0x0000000000000000000000000000000000000000'
export const ETH_ZERO_ADDRESS: PrefixedAddress =
  'eth:0x0000000000000000000000000000000000000000'
export const EOA_ZERO_ADDRESS: PrefixedAddress =
  'eoa:0x0000000000000000000000000000000000000000'

enum Chain {
  ETH = 1,
  OETH = 10,
  GNO = 100,
  SEP = 11155111,
  MATIC = 137,
  ARB1 = 42161,
  AVAX = 43114,
  BASE = 8453,
}

export const RPC: Record<ChainId, string> = {
  [Chain.ETH]: 'https://airlock.gnosisguild.org/api/v1/1/rpc',
  [Chain.OETH]: 'https://airlock.gnosisguild.org/api/v1/10/rpc',
  [Chain.GNO]: 'https://airlock.gnosisguild.org/api/v1/100/rpc',
  [Chain.MATIC]: 'https://airlock.gnosisguild.org/api/v1/137/rpc',
  [Chain.BASE]: 'https://airlock.gnosisguild.org/api/v1/8453/rpc',
  [Chain.ARB1]: 'https://airlock.gnosisguild.org/api/v1/42161/rpc',
  [Chain.AVAX]: 'https://airlock.gnosisguild.org/api/v1/43114/rpc',
  [Chain.SEP]: 'https://airlock.gnosisguild.org/api/v1/11155111/rpc',
}

export const EXPLORER_URL: Record<ChainId, string> = {
  [Chain.ETH]: 'https://etherscan.io',
  [Chain.OETH]: 'https://optimistic.etherscan.io',
  [Chain.GNO]: 'https://gnosisscan.io',
  [Chain.MATIC]: 'https://polygonscan.com',
  [Chain.BASE]: 'https://basescan.org',
  [Chain.ARB1]: 'https://arbiscan.io',
  [Chain.AVAX]: 'https://snowtrace.io',
  [Chain.SEP]: 'https://sepolia.etherscan.io',
}

export const EXPLORER_API_URL: Record<ChainId, string> = {
  [Chain.ETH]: 'https://api.etherscan.io/api',
  [Chain.OETH]: 'https://api-optimistic.etherscan.io/api',
  [Chain.GNO]: 'https://api.gnosisscan.io/api',
  [Chain.MATIC]: 'https://api.polygonscan.com/api',
  [Chain.BASE]: 'https://api.basescan.org/api',
  [Chain.ARB1]: 'https://api.arbiscan.io/api',
  [Chain.AVAX]: 'https://api.snowtrace.io/api',
  [Chain.SEP]: 'https://api-sepolia.etherscan.io/api',
}

export const EXPLORER_API_KEY: Record<ChainId, string> = {
  [Chain.ETH]: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
  [Chain.OETH]: 'SM2FQ62U49I6H9V9CCEGFS34QGBK4IIJPH',
  [Chain.GNO]: 'W575K6DTMSTVB7UFUSNW7GWQ4UWUARTJ7Z',
  [Chain.MATIC]: 'NM937M1IZXVQ6QVDXS73XMF8JSAB677JWQ',
  [Chain.BASE]: 'KCC7EQHE17IAQZA9TICUS6BQTJGZUDRNIY',
  [Chain.ARB1]: 'SJ5BEYBBC3DNSKTH5BAEPFJXUZDAJ133UI',
  [Chain.AVAX]: 'notrequired',
  [Chain.SEP]: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
}

export const CHAIN_PREFIX: Record<ChainId, string> = {
  [Chain.ETH]: 'eth',
  [Chain.OETH]: 'oeth',
  [Chain.GNO]: 'gno',
  [Chain.MATIC]: 'matic',
  [Chain.BASE]: 'base',
  [Chain.ARB1]: 'arb1',
  [Chain.AVAX]: 'avax',
  [Chain.SEP]: 'sep',
}

export const CHAIN_CURRENCY: Record<ChainId, string> = {
  [Chain.ETH]: 'ETH',
  [Chain.OETH]: 'ETH',
  [Chain.GNO]: 'xDAI',
  [Chain.MATIC]: 'MATIC',
  [Chain.BASE]: 'ETH',
  [Chain.ARB1]: 'ETH',
  [Chain.AVAX]: 'AVAX',
  [Chain.SEP]: 'ETH',
}

export const CHAIN_NAME: Record<ChainId, string> = {
  [Chain.ETH]: 'Ethereum',
  [Chain.OETH]: 'Optimism',
  [Chain.GNO]: 'Gnosis',
  [Chain.MATIC]: 'Polygon',
  [Chain.BASE]: 'Base',
  [Chain.ARB1]: 'Arbitrum One',
  [Chain.AVAX]: 'Avalanche C-Chain',
  [Chain.SEP]: 'Sepolia',
}
