/* spell-checker: disable */

import { ChainId } from 'ser-kit'

export const ETH_ZERO_ADDRESS = 'eth:0x0000000000000000000000000000000000000000'

export const RPC: Record<ChainId, string> = {
  1: 'https://airlock.gnosisguild.org/api/v1/1/rpc',
  10: 'https://airlock.gnosisguild.org/api/v1/10/rpc',
  100: 'https://airlock.gnosisguild.org/api/v1/100/rpc',
  137: 'https://airlock.gnosisguild.org/api/v1/137/rpc',
  8453: 'https://airlock.gnosisguild.org/api/v1/8453/rpc',
  42161: 'https://airlock.gnosisguild.org/api/v1/42161/rpc',
  43114: 'https://airlock.gnosisguild.org/api/v1/43114/rpc',
  11155111: 'https://airlock.gnosisguild.org/api/v1/11155111/rpc',
}

export const EXPLORER_URL: Record<ChainId, string> = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  100: 'https://gnosisscan.io',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  43114: 'https://snowtrace.io',
  11155111: 'https://sepolia.etherscan.io',
}

export const EXPLORER_API_URL: Record<ChainId, string> = {
  1: 'https://api.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  100: 'https://api.gnosisscan.io/api',
  137: 'https://api.polygonscan.com/api',
  8453: 'https://api.basescan.org/api',
  42161: 'https://api.arbiscan.io/api',
  43114: 'https://api.snowtrace.io/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
}

export const EXPLORER_API_KEY: Record<ChainId, string> = {
  1: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
  10: 'SM2FQ62U49I6H9V9CCEGFS34QGBK4IIJPH',
  100: 'W575K6DTMSTVB7UFUSNW7GWQ4UWUARTJ7Z',
  137: 'NM937M1IZXVQ6QVDXS73XMF8JSAB677JWQ',
  8453: 'KCC7EQHE17IAQZA9TICUS6BQTJGZUDRNIY',
  42161: 'SJ5BEYBBC3DNSKTH5BAEPFJXUZDAJ133UI',
  43114: 'notrequired',
  11155111: 'N53BKW6ABNX7CNUK8QIXGRAQS2NME92YAN',
}

export const CHAIN_PREFIX: Record<ChainId, string> = {
  1: 'eth',
  10: 'oeth',
  100: 'gno',
  137: 'matic',
  8453: 'base',
  42161: 'arb1',
  43114: 'avax',
  11155111: 'sep',
}

export const CHAIN_CURRENCY: Record<ChainId, string> = {
  1: 'ETH',
  10: 'ETH',
  100: 'xDAI',
  137: 'MATIC',
  8453: 'ETH',
  42161: 'ETH',
  43114: 'AVAX',
  11155111: 'ETH',
}

export const CHAIN_NAME: Record<ChainId, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  100: 'Gnosis',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum One',
  43114: 'Avalanche C-Chain',
  11155111: 'Sepolia',
}
